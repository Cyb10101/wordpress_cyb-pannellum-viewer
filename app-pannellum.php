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
if (!defined('ABSPATH')) {exit();} // Exit if accessed directly

class CybPannellum {
    public function initialize() {
        add_action('init', [$this, 'wpInit']);
    }

    public function wpInit() {
        wp_enqueue_style('pannellum', plugins_url('vendor/pannellum.css', __FILE__), [], '2.5.6');
        wp_enqueue_script('pannellum', plugins_url('vendor/pannellum.js', __FILE__), [], '2.5.6', true);

        wp_enqueue_style('cyb-pannellum', plugins_url('pannellum.css', __FILE__), [],
            filemtime(plugin_dir_path(__FILE__) . 'pannellum.css')
        );
        wp_enqueue_script('cyb-pannellum', plugins_url('pannellum.js', __FILE__), ['pannellum'],
            filemtime(plugin_dir_path(__FILE__) . 'pannellum.js'), true
        );

        wp_register_script('cyb-pannellum-block', plugins_url('block.js', __FILE__),
            ['wp-blocks', 'wp-element', 'wp-components', 'pannellum', 'cyb-pannellum'],
            filemtime(plugin_dir_path(__FILE__) . 'block.js'), true
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

    public function renderBlock($attrs) {
        $id = 'cyb-pannellum_' . (!empty($attrs['uid']) ? $attrs['uid'] : uniqid());

        $json = !empty($attrs['json']) && $attrs['json'] ? $attrs['json'] : '{}';
        $config = json_decode($json, !true);
        if (json_last_error() > 0) {
            return '<div>Pannellum JSON malformed: ' . json_last_error_msg() . '</div>';
        }

        $attributes = $attrs;
        unset($attributes['json']);
        unset($attributes['preview']);

        ob_start();
        ?><div id="<?php echo esc_attr($id); ?>" class="cyb-pannellum"></div>
        <script>
        document.addEventListener('DOMContentLoaded', () => {
            if (typeof pannellum !== 'undefined') {
                try {
                    (new CybPannellum).renderViewer("<?php echo esc_js($id); ?>", {
                        ...<?php echo json_encode($config); ?>,
                        ...<?php echo json_encode($attributes); ?>,
                    });
                } catch(e) {}
            }
        });
        </script><?php
        return ob_get_clean();
    }
}

$cybPannellum = new CybPannellum();
$cybPannellum->initialize();
