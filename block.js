(() => {
  const {createElement, useState, useRef} = wp.element;
  const {registerBlockType} = wp.blocks;
  const {RangeControl, TextControl, PanelBody, ToggleControl, ToolbarGroup, ToolbarButton, Button} = wp.components;
  const {BlockControls, InspectorControls} = wp.blockEditor;

  // Fetch configuration
  const fetchConfig = async (url) => {
    url = (url || '').trim();
    if (!url) {
      return null;
    }
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      return data ?? null;
    } catch (exception) {
      console.error('Pannellum fetchConfig failed', exception);
      return null;
    }
  };

  const hashCode = (str) => {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
    }
    //return h.toString(); // Integer
    return Math.abs(h).toString(36); // 0-9 + a-z
  }

  registerBlockType('cyb/pannellum-viewer', {
    title: 'Cyb Pannellum Viewer',
    icon: 'format-image',
    category: 'embed',

    attributes: {
      uid: {type: 'string', default: ''},
      src: {type: 'string', default: ''},
      preview: {type: 'boolean', default: false},

      basePath: {type: 'string', default: ''},
      hotSpotDebug: {type: 'boolean', default: false},
      autoRotate: {type: 'number', default: -2},
      autoRotateInactivityDelay: {type: 'number', default: 5000},

      yaw: {type: 'number', default: 0},
      pitch: {type: 'number', default: 0},
      hfov: {type: 'number', default: 100},

      custom: {type: 'object', default: {
        controlsBottom: false,
      }},
    },

    edit: (props) => {
      const {attributes, setAttributes, clientId} = props;
      const [error, setError] = useState('');
      const [draftUrl, setDraftUrl] = useState(attributes.src || '');
      const [debouncedAttributes, setDebouncedAttributes] = useState(attributes);
      const refTimer = useRef(0);
      setAttributes({uid: clientId});

      // Debounce attribute changes
      clearTimeout(refTimer.current);
      refTimer.current = setTimeout(() => setDebouncedAttributes(attributes), 500);

      const parseAttributesByConfig = (config) => {
        let newAttributes = {};
        if (config.basePath) {
          newAttributes.basePath = config.basePath && config.basePath !== '' ? config.basePath : '';
        }
        if (config.hasOwnProperty('hotSpotDebug')) {
          newAttributes.hotSpotDebug = config.hotSpotDebug === true;
        }
        if (config.hasOwnProperty('autoRotate')) {
          const parsed = parseInt(config.autoRotate, 10);
          newAttributes.autoRotate = isNaN(parsed) ? 0 : parsed;
        }
        if (config.hasOwnProperty('autoRotateInactivityDelay')) {
          const parsed = parseInt(config.autoRotateInactivityDelay, 10);
          newAttributes.autoRotateInactivityDelay = isNaN(parsed) ? 0 : parsed;
        }

        if (config.hasOwnProperty('yaw')) {
          const parsed = parseInt(config.yaw, 10);
          newAttributes.yaw = isNaN(parsed) ? 0 : parsed;
        }
        if (config.hasOwnProperty('pitch')) {
          const parsed = parseInt(config.pitch, 10);
          newAttributes.pitch = isNaN(parsed) ? 0 : parsed;
        }
        if (config.hasOwnProperty('hfov')) {
          const parsed = parseInt(config.hfov, 10);
          newAttributes.hfov = isNaN(parsed) ? 0 : parsed;
        }

        if (config.hasOwnProperty('custom')) {
          newAttributes.custom = {};
          if (config.custom.hasOwnProperty('controlsBottom')) {
            newAttributes.custom.controlsBottom = (config.custom.controlsBottom === true);
          }
        }
        return newAttributes;
      }

      const pannellumPreview = createElement('div', {
        key: hashCode(JSON.stringify(debouncedAttributes)), // Used for new rendering
        id: 'cyb-pannellum-viewer_' + debouncedAttributes.uid,
        className: 'cyb-pannellum-viewer',
        'data-src': debouncedAttributes.src,
        'data-override': JSON.stringify({
            basePath: debouncedAttributes.basePath,
            hotSpotDebug: debouncedAttributes.hotSpotDebug,
            autoRotate: debouncedAttributes.autoRotate,
            autoRotateInactivityDelay: debouncedAttributes.autoRotateInactivityDelay,

            yaw: debouncedAttributes.yaw,
            pitch: debouncedAttributes.pitch,
            hfov: debouncedAttributes.hfov,

            custom: debouncedAttributes.custom,
        }),
        style: {
          minHeight: '50px',
          background: '#f7f7f7',
        },
      });

      const errorBox = createElement(
          'div', {
            style: {
              display: 'flex', alignItems: 'center', gap: '0.2em',
              color: '#991b1b', backgroundColor: '#ffe6e6',
              marginBottom: '5px', padding: '4px', borderRadius: '4px'
            }
          },
          createElement('span', {class: 'dashicons dashicons-warning'}, ''),
          createElement('b', {}, ' Error: '), error
        );

      const editUrl = createElement(
        'div', {
          style: {
            display: 'flex', flexDirection: 'column',
            background: '#f7f7f7', border: '1px solid #ddd', borderRadius: '4px', padding: '5px',
          }
        },
        createElement('h4', {style: {margin: '0 0 0.8em'}}, 'Enter a config.json URL below and click Embed.'),
        createElement(
          TextControl, {
            label: 'Config JSON URL',
            hideLabelFromVision: true,
            placeholder: '/panorama/pannellum/project/config.json',
            value: draftUrl,
            onChange: (val) => {
              setError('');
              setDraftUrl(val);
            },
            style: {flex: '1 0 auto'}
          }
        ),
        error !== '' ? errorBox : null,
        createElement(
          Button, {
            variant: 'primary',
            onClick: async () => {
              const config = await fetchConfig(draftUrl);
              if (config) {
                let newAttributes = parseAttributesByConfig(config);
                newAttributes = {
                  ...newAttributes,
                  src: draftUrl,
                  preview: true
                };
                setAttributes(newAttributes);
                setError('');
              } else {
                setError('Config not loaded');
                setAttributes({preview: false});
              }
            }
          },
          'Embed'
        ),
      );

      const sidebarSettings = createElement(
        PanelBody, {title: 'Settings', initialOpen: true},
        createElement(
          TextControl, {
            label: 'Base Path',
            placeholder: '/panorama/pannellum/project/',
            help: 'Automatically generated by source file.',
            value: attributes.basePath || '',
            type: 'text',
            onChange: (val) => setAttributes({basePath: val}),
          }
        ),
        createElement(
          ToggleControl, {
            label: 'Debug Position',
            help: 'Click on image and see hotspot positions in developer console.',
            checked: attributes.hotSpotDebug || false,
            onChange: (val) => setAttributes({hotSpotDebug: val})
          }
        ),
        createElement(
          RangeControl, {
            label: 'Auto Rotate Speed',
            value: attributes.autoRotate || 0,
            onChange: (val) => setAttributes({autoRotate: val}),
            min: -20,
            max: 20,
            step: 1
          }
        ),
        createElement(
          TextControl, {
            label: 'Auto Rotate Inactivity Delay (ms)',
            value: attributes.autoRotateInactivityDelay || 5000,
            type: 'number',
            step: 500,
            min: 0,
            onChange: (val) => setAttributes({autoRotateInactivityDelay: val}),
          }
        ),
      );

      const sidebarInitialPosition = createElement(
        PanelBody, {title: 'Initial Position', initialOpen: false},
        createElement(
          RangeControl, {
            label: 'Horizontal rotation',
            help: 'Sets the panorama’s starting yaw position in degrees.',
            value: attributes.yaw || 0,
            onChange: (val) => setAttributes({yaw: val}),
            min: -180,
            max: 180,
            step: 1
          }
        ),
        createElement(
          RangeControl, {
            label: 'Vertical rotation',
            help: 'Sets the panorama’s starting pitch position in degrees.',
            value: attributes.pitch || 0,
            onChange: (val) => setAttributes({pitch: val}),
            min: -90,
            max: 90,
            step: 1
          }
        ),
        createElement(
          RangeControl, {
            label: 'Horizontal Field of View',
            help: 'Sets the panorama’s starting horizontal field of view in degrees.',
            value: attributes.hfov || 0,
            onChange: (val) => setAttributes({hfov: val}),
            min: 50,
            max: 120,
            step: 1
          }
        ),
      );

      const sidebarCustomOptions = createElement(
        PanelBody, {title: 'Custom Options', initialOpen: false},
        createElement(
          ToggleControl, {
            label: 'Bottom Controls',
            help: 'Add controls at bottom',
            checked: attributes.custom.controlsBottom || false,
            onChange: (val) => setAttributes({custom: {...attributes.custom, controlsBottom: val}})
          }
        ),
      );

      const sidebar = createElement(
        InspectorControls, null,
        attributes.preview ? sidebarSettings : null,
        attributes.preview ? sidebarInitialPosition : null,
        attributes.preview ? sidebarCustomOptions : null,
      );

      const toolbar = createElement(
        BlockControls, null,
        createElement(
          ToolbarGroup, null,
          attributes.preview ? createElement(
            ToolbarButton, {
              icon: 'edit',
              label: 'Edit URL',
              onClick: () => {
                setAttributes({preview: !attributes.preview});
              },
              isPressed: !attributes.preview
            }
          ): null
        )
      );

      return createElement(
        'div', null, sidebar, toolbar,
        attributes.preview ? pannellumPreview : editUrl
      );
    },

    save: () => null,
  });
})(wp);
