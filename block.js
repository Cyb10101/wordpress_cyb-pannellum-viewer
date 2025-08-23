(() => {
  const {createElement, useState} = wp.element;
  const {registerBlockType} = wp.blocks;
  const {TextareaControl, RangeControl, TextControl, PanelBody, ToggleControl, ToolbarGroup, ToolbarButton} = wp.components;
  const {BlockControls} = wp.blockEditor || wp.editor;
  const {InspectorControls} = wp.blockEditor;

  const CustomUploadControl = ({onDataLoaded}) => {
    const [fileName, setFileName] = useState('');
    const [error, setError] = useState(false);
    const [timeoutMessage, setTimeoutMessage] = useState(null);

    const handleFile = (file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (timeoutMessage) {
          clearTimeout(timeoutMessage);
          setTimeoutMessage(null);
        }
        setError(false);

        try {
          let data = e.target.result;
          onDataLoaded(data);
          setFileName(file.name);
        } catch (err) {
          console.error('Invalid file', err);
        }

        setTimeoutMessage(
          setTimeout(() => {
            setFileName('');
            setError(false);
          }, 5000)
        );
      };
      reader.readAsText(file);
    };

    const handleChange = (e) => {
      if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
      }
    };

    return createElement(
      'div', null,
      createElement(
        'div', {
          style: {
            flex: '0 1 auto', alignSelf: 'center', display: 'block', textTransform: 'uppercase',
            fontSize: '11px', fontWeight: '500', lineHeight: '1.4', marginBottom: '8px', padding: '0px'
          }
        }, 'Load config.json'
      ),
      createElement(
        'div', {
          style: {display: 'flex', gap: '10px', alignItems: 'flex-start'}
        },
        createElement(
          'input', {
            type: 'file',
            accept: '.json',
            onChange: handleChange,
            style: {flex: '1 1 auto'}
          }
        ),
        fileName && createElement(
          'div', {
            style: {flex: '1 1 auto', fontSize: '0.8em', textAlign: 'end', alignSelf : 'center'}
          },
          !error ? `✅ ${fileName} loaded.` : `⚠️ ${fileName} loaded, but not successfully parsed!`
        )
      )
    );
  }

  registerBlockType('cyb/pannellum-viewer', {
    title: 'Cyb Pannellum Viewer',
    icon: 'format-image',
    category: 'embed',

    attributes: {
      uid: {type: 'string', default: ''},
      json: {type: 'string', default: ''},
      preview: {type: 'boolean', default: false},
      basePath: {type: 'string', default: ''},
      hotSpotDebug: {type: 'boolean', default: false},
      autoRotate: {type: 'integer', default: -2},
      autoRotateInactivityDelay: {type: 'number', default: 5000},
      custom: {type: 'object', default: {
        controlsBottom: false,
      }},
    },

    edit: (props) => {
      const {attributes, clientId, setAttributes} = props;
      setAttributes({uid: clientId});

      const previewId = 'cyb-pannellum-preview_' + attributes.uid;
      const uniqueKey = JSON.stringify(attributes);

      // Preview
      let pannellumPreview = null;
      try {
        const config = JSON.parse(attributes.json);
        Object.assign(config, {
          basePath: attributes.basePath,
          hotSpotDebug: attributes.hotSpotDebug,
          autoRotate: attributes.autoRotate,
          autoRotateInactivityDelay: attributes.autoRotateInactivityDelay,
        });
        config.custom = {
          ...(config.custom || {}),
          controlsBottom: attributes.custom && attributes.custom.controlsBottom,
        };

        pannellumPreview = createElement(
          'div', {
            key: uniqueKey, id: previewId, className: 'cyb-pannellum', style: {}, 'data-config': JSON.stringify(config)
          }
        );
      } catch (exception) {
        pannellumPreview = createElement('p', null, '⚠️ Invalid JSON config');
      }

      const updateConfig = (json) => {
        try {
          const config = JSON.parse(json);
          if (config.hasOwnProperty('basePath')) {
            attributes.basePath = config.basePath && config.basePath !== '' ? config.basePath : '';
          }
          if (config.hasOwnProperty('hotSpotDebug')) {
            attributes.hotSpotDebug = config.hotSpotDebug === true;
          }
          if (config.hasOwnProperty('autoRotate')) {
            const parsed = parseInt(config.autoRotate, 10);
            attributes.autoRotate = isNaN(parsed) ? 0 : parsed;
          }
          if (config.hasOwnProperty('autoRotateInactivityDelay')) {
            const parsed = parseInt(config.autoRotateInactivityDelay, 10);
            attributes.autoRotateInactivityDelay = isNaN(parsed) ? 0 : parsed;
          }

          if (config.hasOwnProperty('custom')) {
            const custom = attributes.custom;
            if (config.custom.hasOwnProperty('controlsBottom')) {
              custom.controlsBottom = (config.custom.controlsBottom === true);
            }
            attributes.custom = custom;
          }
        } catch (exception) {
          // console.error(exception.message);
        }
      }

      // Json Editor
      const pannellumEditor = createElement(
        'div', null,
        createElement(
          TextareaControl, {
            label: 'Pannellum JSON Config',
            value: attributes.json,
            onChange: value => {
              updateConfig(value);
              setAttributes({json: value});
            },
            rows: 15,
          }
        ),
        createElement(
          CustomUploadControl, {
            onDataLoaded: (data) => {
              updateConfig(data);
              setAttributes({json: data});
              if (attributes.basePath && attributes.basePath !== '') {
                setAttributes({preview: true});
              }
            }
          }
        )
      );

      return createElement(
        'div', null,
        createElement(
          InspectorControls, null,

          createElement(
            PanelBody, {title: 'Settings', initialOpen: true},
            createElement(
              TextControl, {
                label: 'Base Path',
                value: attributes.basePath || '/',
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
                label: 'Auto Rotate Inactivity Delay (sec)',
                value: attributes.autoRotateInactivityDelay || 5000,
                type: 'number',
                step: 500,
                min: 0,
                onChange: (val) => setAttributes({autoRotateInactivityDelay: val}),
              }
            )
          ),

          createElement(
            PanelBody, {title: 'Custom Options', initialOpen: true},
            createElement(
              ToggleControl, {
                label: 'Bottom Controls',
                help: 'Add controls at bottom',
                checked: attributes.custom.controlsBottom || false,
                onChange: (val) => setAttributes({custom: {...attributes.custom, controlsBottom: val}})
              }
            ),
          )
        ),
        createElement(
          BlockControls, null,
          createElement(
            ToolbarGroup, null,
            createElement(
              ToolbarButton, {
                icon: attributes.preview ? 'visibility' : 'hidden',
                label: attributes.preview ? 'Hide Preview' : 'Show Preview',
                onClick: () => setAttributes({preview: !attributes.preview}),
                isPressed: attributes.preview,
              }
            )
          )
        ),
        attributes.preview ? pannellumPreview : pannellumEditor
      );
    },

    save: () => {
      return null;
    },
  });
})(wp);
