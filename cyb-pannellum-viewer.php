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
                'json' => ['type' => 'string', 'default' => ''],
            ],
        ]);
    }

    public function wpEnqueueBlockEditorAssets() {
        $this->enqueueAssets();
    }

    protected function enqueueAssets() {
        wp_enqueue_style('pannellum');
        wp_enqueue_script('pannellum');

        wp_enqueue_style('cyb-pannellum-viewer');
        wp_enqueue_script('cyb-pannellum-viewer');
    }

    public function renderBlock(array $attrs): string {
        $id = 'cyb-pannellum_' . (!empty($attrs['uid']) ? $attrs['uid'] : uniqid());

        $json = !empty($attrs['json']) && $attrs['json'] ? $attrs['json'] : '{}';
        $config = json_decode($json, true);
        if (json_last_error() > 0) {
            return '<div>Pannellum JSON malformed: ' . json_last_error_msg() . '</div>';
        }

        unset($attrs['json']);
        unset($attrs['preview']);
        $merged = array_replace_recursive($config, $attrs);

        $this->enqueueAssets();
        return '<div id="' . esc_attr($id) . '" class="cyb-pannellum" data-config=\'' . wp_json_encode($merged) . '\'></div>';
    }
}

$cybPannellumViewer = new CybPannellumViewer();
$cybPannellumViewer->initialize();
