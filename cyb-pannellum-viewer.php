<?php
/*
Plugin Name: Cyb Pannellum Viewer
Plugin URI: https://github.com/Cyb10101/wordpress_cyb-pannellum-viewer
Description: Adds a Pannellum Viewer
Author: Cyb10101
Version: 1.0.0
Author URI: https://cyb10101.de/
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html
*/

if (!defined('ABSPATH')) {
    exit(); // Exit if accessed directly
}

class CybPannellumViewer {
    public function initialize() {
        add_action('init', [$this, 'wpInit']);
        add_action('enqueue_block_editor_assets', [$this, 'wpEnqueueBlockEditorAssets']);
    }

    /**
     * Wordpress initialize
     */
    public function wpInit() {
        wp_register_style('pannellum', plugins_url('vendor/pannellum.css', __FILE__), [], '2.5.6');
        wp_register_script('pannellum', plugins_url('vendor/pannellum.js', __FILE__), [], '2.5.6',
            [
                'in_footer' => true,
                'strategy'  => 'async',
            ]
        );

        wp_register_style('cyb-pannellum-viewer', plugins_url('pannellum-viewer.css', __FILE__), [],
            filemtime(plugin_dir_path(__FILE__) . 'pannellum-viewer.css')
        );
        wp_register_script('cyb-pannellum-viewer', plugins_url('pannellum-viewer.js', __FILE__), ['pannellum'],
            filemtime(plugin_dir_path(__FILE__) . 'pannellum-viewer.js'),
            [
                'in_footer' => true,
                'strategy'  => 'async',
            ]
        );

        wp_register_script('cyb-pannellum-block', plugins_url('block.js', __FILE__),
            ['wp-blocks', 'wp-element', 'wp-components'],
            filemtime(plugin_dir_path(__FILE__) . 'block.js'),
            [
                'in_footer' => true,
                'strategy'  => 'async',
            ]
        );

        register_block_type('cyb/pannellum-viewer', [
            'editor_script' => 'cyb-pannellum-block',
            'render_callback' => [$this, 'renderBlock'],
            'attributes' => [
                'uid' => ['type' => 'string', 'default' => ''],
                'src' => ['type' => 'string', 'default' => ''],
                // Preview not needed

                'basePath' => ['type' => 'string', 'default' => ''],
                'hotSpotDebug' => ['type' => 'boolean', 'default' => false],
                'autoRotate' => ['type' => 'number', 'default' => -2],
                'autoRotateInactivityDelay' => ['type' => 'number', 'default' => 5000],

                'hfov' => ['type' => 'number', 'default' => 100],
                'yaw' => ['type' => 'number', 'default' => 0],
                'pitch' => ['type' => 'number', 'default' => 0],

                'custom' => ['type' => 'object', 'default' => [
                    'controlsBottom' => false,
                ]],
            ],
        ]);
    }

    /**
     * Wordpress enqueue block editor assets
     */
    public function wpEnqueueBlockEditorAssets() {
        $this->enqueueAssets();
    }

    protected function enqueueAssets() {
        wp_enqueue_style('pannellum');
        wp_enqueue_script('pannellum');

        wp_enqueue_style('cyb-pannellum-viewer');
        wp_enqueue_script('cyb-pannellum-viewer');
    }

    /**
     * Render block for frontend
     */
    public function renderBlock(array $attributes, string $content, \WP_Block $block): string {
        $id = 'cyb-pannellum-viewer_' . (!empty($attributes['uid']) ? $attributes['uid'] : '');
        $src = (!empty($attributes['src']) ? $attributes['src'] : '');

        $override = [
            'basePath' => $attributes['basePath'],
            'hotSpotDebug' => $attributes['hotSpotDebug'],
            'autoRotate' => $attributes['autoRotate'],
            'autoRotateInactivityDelay' => $attributes['autoRotateInactivityDelay'],

            'yaw' => $attributes['yaw'],
            'pitch' => $attributes['pitch'],
            'hfov' => $attributes['hfov'],

            'custom' => $attributes['custom'],
        ];

        $this->enqueueAssets();
        return '<div id="' . esc_attr($id) . '" class="cyb-pannellum-viewer"'
            . ' data-src="' . esc_attr($src) . '"'
            . ' data-override=\'' . esc_attr(wp_json_encode($override)) . '\'></div>';
    }
}

$cybPannellumViewer = new CybPannellumViewer();
$cybPannellumViewer->initialize();
