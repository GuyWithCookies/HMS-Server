module.exports = function(grunt) {
    grunt.initConfig({
        pkg : grunt.file.readJSON('package.json'),
        bower_concat : {
            all : {
                dest : {
                    'js' : 'admin/public/jsExt/bower.js',
                    'css' : 'admin/public/css/bower.css'
                },
                mainFiles : {
                    bootstrap : ['dist/css/bootstrap.css', 'dist/js/bootstrap.min.js']
                },
                dependencies: {
                    'angular-google-maps': ['angular', "lodash", "angular-simple-logger"]
                }
            }
        },
        copy : {
            bower : {
                files : [ {
                    expand:true,
                    cwd:"bower_components/bootstrap/dist/",
                    src : "fonts/*",
                    dest : "./admin/public/"
                },{
                    expand:true,
                    cwd:"bower_components/angular-ui-grid/",
                    src : ["ui-grid.svg","ui-grid.ttf","ui-grid.woff"],
                    dest : "./admin/public"
                } ]
            }
        }
    });
    grunt.loadNpmTasks('grunt-bower-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.registerTask("default", [ "bower_concat", "copy"]);
};
