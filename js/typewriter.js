// Typewriter
//	License MIT
//	https://github.com/onlyblank/bestypewriter
(function($, w, d, undefined) {
	function typewriter() {
		var self = this, speed;
		function init(element, options) {
			var str,indice = 0;
			self.options = $.extend( {}, $.fn.typewriter.options, options );
			$currentElement = $(element);
			elementStr = $currentElement.text().replace(/\s+/g, ' ');
			dataSpeed  = $currentElement.data("speed") || self.options.speed;
			$currentElement.empty();
			var showText = setInterval(
				function(){
					if (indice++ < elementStr.length) {
						$currentElement.append(elementStr[indice]);
					}
					else{
						clearInterval(showText);
					}
				},
			dataSpeed);
	}
	return {
		init: init
	}
}
$.fn.typewriter = function(options) {
	return this.each(function () {
		var writer =  new typewriter();
		writer.init(this, options);
		$.data( this, 'typewriter', writer);
	});
};
$.fn.typewriter.options = {
	'speed' : 300
};
})(jQuery, window, document);
