# Cyb Pannellum Viewer
Tested up to: 6.8
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Embed interactive 360° panoramas in WordPress Gutenberg using Pannellum for virtual tours or exhibitions.

## Description

A plugin for the WordPress Gutenberg block editor.

Embed interactive 360° panoramas using [Pannellum](https://pannellum.org/), supporting equirectangular, cubemap, and multi-resolution tile formats.

Perfect for virtual tours, exhibitions or immersive media content.

## Links

* [Plugin on WordPress](https://wordpress.org/plugins/cyb-pannellum-viewer)
* [Source Code](https://github.com/Cyb10101/wordpress_cyb-pannellum-viewer)

## Note

The goal of the project was to implement a panorama in a relatively simple way.
The basic configuration is done via JSON. Everything else is features.
So there is more magic here than planned.

## Usage

You can generate multi-resolution tiles for a panorama with [Pannellum multires tool](https://github.com/mpetroff/pannellum/tree/master/utils/multires).

1. Generate panorama
2. Create a `config.json` if it is not already automatically generated
3. Copy files to `/panorama/pannellum/project/` (for example)
4. Add the **Pannellum Viewer** WordPress block in the Gutenberg editor
5. Embed `/panorama/pannellum/project/config.json`

## Credits

This plugin uses [Pannellum (MIT License)](https://pannellum.org) for displaying panoramic images.

All third-party components retain their original licenses.
