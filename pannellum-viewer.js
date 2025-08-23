'use strict';

class CybPannellum {
  initialize() {
    const seen = new WeakSet();
    const runOnce = (element) => {
      if (element && !seen.has(element)) {
        seen.add(element);
        this.run(element);
      }
    };

    // Element rendered with PHP
    document.querySelectorAll('.cyb-pannellum-viewer').forEach(runOnce);

    // Element added with JavaScript
    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== 1) {
            continue;
          }
          if (node.matches && node.matches('.cyb-pannellum-viewer')) {
            runOnce(node);
          } else if (node.querySelector && node.querySelector('.cyb-pannellum-viewer')) {
            runOnce(node.querySelector('.cyb-pannellum-viewer'));
          }
        }
      }
    });
    observer.observe(document.body, {childList: true, subtree: true});
  }

  renderViewer(containerId, config = null) {
    this.run(document.getElementById(containerId), config);
  }

  run(container, config = null) {
    if (container.dataset.initialized) {
        return;
    }
    container.dataset.initialized = 1;

    if (!config && container.dataset.config !== '') {
      config = JSON.parse(container.dataset.config);
    }

    const viewer = pannellum.viewer(container.id, config);
    if (config.custom && config.custom.controlsBottom) {
      this.addControls(container, viewer);
    }
  }

  addControls(container, viewer) {
    const controls = document.createElement('div');
    controls.classList.add('controls');

    const controlPanUp = document.createElement('div');
    controlPanUp.classList.add('ctrl', 'pan-up');
    controlPanUp.innerHTML = '&#9650;';

    const controlPanDown = document.createElement('div');
    controlPanDown.classList.add('ctrl', 'pan-down');
    controlPanDown.innerHTML = '&#9660;';

    const controlPanLeft = document.createElement('div');
    controlPanLeft.classList.add('ctrl', 'pan-left');
    controlPanLeft.innerHTML = '&#9664;';

    const controlPanRight = document.createElement('div');
    controlPanRight.classList.add('ctrl', 'pan-right');
    controlPanRight.innerHTML = '&#9654;';

    const controlZoomIn = document.createElement('div');
    controlZoomIn.classList.add('ctrl', 'zoom-in');
    controlZoomIn.innerHTML = '&plus;';

    const controlZoomout = document.createElement('div');
    controlZoomout.classList.add('ctrl', 'zoom-out');
    controlZoomout.innerHTML = '&minus;';

    const controlFullscreen = document.createElement('div');
    controlFullscreen.classList.add('ctrl', 'fullscreen');
    controlFullscreen.innerHTML = '&#x2922;';

    controls.appendChild(controlPanUp);
    controls.appendChild(controlPanDown);
    controls.appendChild(controlPanLeft);
    controls.appendChild(controlPanRight);
    controls.appendChild(controlZoomIn);
    controls.appendChild(controlZoomout);
    controls.appendChild(controlFullscreen);
    container.appendChild(controls);

    controlPanUp.addEventListener('click', () => {
      viewer.setPitch(viewer.getPitch() + 10);
    });
    controlPanDown.addEventListener('click', () => {
      viewer.setPitch(viewer.getPitch() - 10);
    });
    controlPanLeft.addEventListener('click', () => {
      viewer.setYaw(viewer.getYaw() - 10);
    });
    controlPanRight.addEventListener('click', () => {
      viewer.setYaw(viewer.getYaw() + 10);
    });
    controlZoomIn.addEventListener('click', () => {
      viewer.setHfov(viewer.getHfov() - 10);
    });
    controlZoomout.addEventListener('click', () => {
      viewer.setHfov(viewer.getHfov() + 10);
    });
    controlFullscreen.addEventListener('click', () => {
      viewer.toggleFullscreen();
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  (new CybPannellum).initialize();
});
