/*
var styleFormats = [
    { title: 'Bold text', inline: 'b' },
    { title: 'Red text', inline: 'span', styles: { color: '#ff0000' } },
    { title: 'Red header', block: 'h1', styles: { color: '#ff0000' } },
    { title: 'Example 1', inline: 'span', classes: 'example1' },
    { title: 'Example 2', inline: 'span', classes: 'example2' },
    { title: 'Table styles' },
    { title: 'Table row 1', selector: 'tr', classes: 'tablerow1' }
];

var plugins = "hts,courselink,example,autolink,lists,pagebreak,style,layer,table,save,advhr,advimage,advlink,emotions,iespell,inlinepopups,insertdatetime,preview,media,searchreplace,print,contextmenu,paste,directionality,fullscreen,noneditable,visualchars,nonbreaking,xhtmlxtras,template,wordcount,advlist,autosave,spellchecker,-testbox";

var toolbar1 = "bold,italic,underline,strikethrough,subSupDropdown,forecolor,backcolor,|,fontselect,fontsizeselect,|,styleselect,formatselect";

var toolbar2 = "justifyDropdown,bullist,indentDropdown,|,textOpsDropdown,|,search,replace,|,undo,redo,|,spellchecker,ispell,tableDropdown,|,courselink,image,media,htsFormulaEditor,htsEditorMenu,charmap,hr,pagebreak,|,quickLinkList,|,code";

*/

var tiny_mce_PxPage = parent.window.PxPage;  // window.parent.PxPage.launchpad_editor_options.equation_image_path,

var equation_image_path = 'http://px.bfwpub.com/PxHTS/geteq.ashx', 
    extended_valid_elements = tinymce_extended.extended_valid_elements + '|iprof|hts-data-id|hts-data-type|hts-data-equation|hts-data-variable-type|hts-data-variable-index',
    config = {
        equation_image_path: equation_image_path,
        extended_valid_elements: extended_valid_elements
    };


function load_jscss_file(filename, filetype) {
    var fileref;
    if (filetype == "js") { //if filename is a external JavaScript file
        fileref = document.createElement('script');
        fileref.setAttribute("type", "text/javascript");
        fileref.setAttribute("src", filename);
    }
    else if (filetype == "css") { //if filename is an external CSS file
        fileref = document.createElement("link");
        fileref.setAttribute("rel", "stylesheet");
        fileref.setAttribute("type", "text/css");
        fileref.setAttribute("href", filename);
    }
    if (typeof fileref != "undefined")
        document.getElementsByTagName("head")[0].appendChild(fileref);
}

load_jscss_file("/Scripts/tiny_mce/themes/advanced/skins/default/content.css", "css");
load_jscss_file("/Scripts/tiny_mce/themes/advanced/skins/default/dialog.css", "css");
load_jscss_file("/Scripts/tiny_mce/themes/advanced/skins/default/ui.css", "css"); 

tinymce.PluginManager.load('launchpad', '/scripts/tiny_mce/plugins/launchpad/editor_plugin.js');
tinymce.PluginManager.load('hts', '/scripts/tiny_mce/plugins/hts/editor_plugin.js');
tinymce.PluginManager.load('justifyDropdown', '/scripts/tiny_mce/plugins/justifyDropdown/editor_plugin.js');
//tinymce.PluginManager.load('advimage', '/scripts/tiny_mce/plugins/advimage/editor_plugin.js');

var macmillanBase = Ext.apply({}, {
	plugins: "launchpad,hts,justifyDropdown,autolink,lists,spellchecker,pagebreak,style,layer,table,save,advhr,advimage,advlink,emotions,iespell,inlinepopups,insertdatetime,preview,media,searchreplace,print,paste,directionality,fullscreen,noneditable,visualchars,nonbreaking,xhtmlxtras,template,advimage", 
	mode: "textareas",
	theme: "advanced",
	skin : "default",
	theme_advanced_buttons1 : "bold,mymorestylesbutton,sizebutton,forecolor,|,justifyDropdown,bullist,|,table,link,image,media,htsFormulaEditor,|,code",
	theme_advanced_buttons2 : "",
	theme_advanced_buttons3 : "",
	theme_advanced_toolbar_location : "top",
	theme_advanced_toolbar_align : "left",
	theme_advanced_statusbar_location : "bottom",
	theme_advanced_resizing : true,
	theme_advanced_path : false,
	convert_urls: false,
	gecko_spellcheck : true,
	
	equation_image_path: equation_image_path,

	setup: function(ed) {
		// word count in bottom of editor
		ed.onKeyUp.add(function(ed, e) {    
			var strip = (tinyMCE.activeEditor.getContent( {format : 'raw'} )).replace(/(<([^>]+)>)/ig,"");
			var text = "";
			if (strip != "") {
				text = "<span style='font-size:10px;'>Word count: " + strip.split(' ').length + "</span>";
			}
			tinymce.DOM.setHTML(tinymce.DOM.get(tinyMCE.activeEditor.id + '_path_row'), text);    
		});
	},		
	init_instance_callback : "editorInitialized",
	width: "500",
	height: "100",
    extended_valid_elements: extended_valid_elements
}, tinymce_basic);	
			
tinymce_extended = macmillanBase;

tinymce_extended_wide = macmillanBase;

tinymce_base = Ext.apply({}, config, macmillanBase);

tinymce_basic_with_images_forum = Ext.apply({}, config, macmillanBase);




