window.onload = function() {
	var fileInput = document.getElementById('fileInput');
	var fileDisplayArea = document.getElementById('fileDisplayArea');
	var div = document.getElementById('page-wrapper')
	fileInput.addEventListener('change', function(e) {
		var file = fileInput.files[0];
		var imageType = /image.*/;

		if (file.type.match(imageType)) {
			var reader = new FileReader();

			reader.onload = function(e) {
				img = reader.result;
				div.remove();
				var script = document.createElement("script");
                script.type = "text/javascript";
                script.src = "./scripts/sketch.js"; 
                document.getElementsByTagName("head")[0].appendChild(script);
                window.location.reload(true);
			}
			reader.readAsDataURL(file);	
		} else {
			fileDisplayArea.innerHTML = "File not supported!"
		}
	});
}