const storageMode = sessionStorage
var path = ""
var cutPath = null
var cutFileName = null

const videoFilesExt = ["webm", "mp4", "avi", "wmv", "mov", "mkv"]
const imageFilesExt = ["jpg", "png", "gif", "webp", "tiff", "psd", "bmp", "jpeg", "svg"]
const docFilesExt = ["doc", "docx", "xls", "xlsx", "ppt", "pptx", "ppsm", "odt", "ods", "odp", "odg", "odc", "odf", "odb", "odi", "odm", "pdf"]
const musicFilesExt = ["wav", "ogg", "flac", "mp3"]
const codeFilesExt = ["c", "h", "cpp", "hpp", "js", "css", "html", "php", "go", "java", "py", "rs", "ruby", "jl", "f", "for","cs", "swift", "sql", "sh", "bat", "kt", "kts", "lua", "r"]

function getFileExt(filename) {
	let parts = filename.split('.')
	return parts.length > 1 ? parts.pop() : ""
}

function getFileImage(filename) {
	let ext = getFileExt(filename)
	let link = "file.svg"
	if (ext == "") {
		return link
	}

	if (videoFilesExt.includes(ext)) {
		link = "file-video.svg"
	} else if (imageFilesExt.includes(ext)) {
		link =  "file-image.svg"
	} else if (docFilesExt.includes(ext)) {
		link = "file-doc.svg"
	} else if (musicFilesExt.includes(ext)) {
		link = "file-music.svg"
	} else if (codeFilesExt.includes(ext)) {
		link = "file-code.svg"
	}
	return link
}

function redirect(_route, _path) {
	l.routes.goto(_route, _path)
}

function fadeOut(element) {
	var op = 1;  // initial opacity
	var pas = 0.05;
    var timer = setInterval(function () {
        if (op <= 0){
            clearInterval(timer);
			element.style.display = 'none';
			element.parentNode.removeChild(element)
        }
        element.style.opacity = op;
        op -= pas;
    }, 15);
}

/**
 * Get the login in internal storage
 */
function getLogin() {
	return storageMode.getItem("login")
}

/**
 * Get the token in internal storage
 */
function getToken() {
	return storageMode.getItem("token")
}

/**
 * Set the login in internal storage
 * @param {string} login 
 */
function setLogin(login) {
	storageMode.setItem("login", login)
}

/**
 * Set the token in internal storage
 * @param {string} token 
 */
function setToken(token) {
	storageMode.setItem("token", token)
}

/**
 * Remove the login in internal storage
 */
function unsetLogin() {
	storageMode.removeItem("login")
}

/**
 * Remove the token in internal storage
 */
function unsetToken() {
	storageMode.removeItem("token")
}

function setUploadPath() {
	storageMode.setItem("upload-path", path)
}

function setModFile(filePath) {
	storageMode.setItem("file-mod", filePath)
}

/**
 * Check if the user is well authenticated, using api
 */
function isLoggedIn() {
	if (getLogin() != null && getToken() != null) {
		return true // Can be improved
	}
	return false
}

/**
 * Check if the user is well authenticated, NOT using api
 */
function isLoggedInFast() {
	if (getLogin() != null && getToken() != null) {
		return true
	}
	return false
}

function formatByteSize(size) {
	let _size = size
	let units = ["B", "KB", "MB", "GB"]
	let unit_number = 0
	while (~~(_size / 1000) >= 1 && unit_number < 3) {
		unit_number++
		_size = ~~(_size / 1000)
	}
	return _size + " " + units[unit_number]
}


/**
 * make a request to api to login, getting the token and (already known) login.
 * @param {string} _login 
 * @param {string} _password 
 */
var loginRequest = function(_login, _password) {
    l.requests.makej("GET", "./api/session/login", {
		query: {
			login: document.getElementById("login-username").value,
			password: document.getElementById("login-password").value
		}
    })
    .then(function(data) {
        if (data.status == "success") {
			setLogin(data.login)
			setToken(data.token)
			redirect("/app", path)
		} else {
			window.alert(data.message)
		}
	})
}

/**
 * make a request to api to logout. unset login and token so logout succeed every time
 */
var logoutRequest = function() {
	l.requests.make("GET", "./api/session/logout", {
		query: {
			login: getLogin(),
			token: getToken()
		}
    })
	unsetLogin()
	unsetToken()
}


/**
 * Object that contains app data, including vars and callback functions of APP route.
 * Other routes callback were built before Leloux and are located in global scope.
 */
var Data = {
	app: {
		directory: [],
		renderTab: function() {
			let tabRender = []
			Data.app.directory.forEach(function (el) {
				if (el.isDir) {
					tabRender.push(l("tr", {"class": "directory", "data-element": el.name}, 
						l("td", {"data-label": "Folder"}, l("a", {
							href: "#!/app!" + encodeURI(path) + "/" + encodeURI(el.name)
						},
							l("img", {src: "./icons/folder.svg", style: "display: table-cell; vertical-align: text-top;"}, null), 
							" " + el.name
						)),
						l("td", {"data-label":""}, ""),
						l("td", {style: "text-align:right", "data-label": "Actions"}, 
							l("img", {src: "./icons/folder-x.svg", class:"icon-action", "title": "Remove folder", events: {
								click: (e) => {
									Data.app.rmRequest(e.target)
								}
							}}, null),
							l("img", {src: "./icons/rename.svg", class:"icon-action", "title": "Rename folder", events: {
								click: (e) => {
									Data.app.rename(e.target)
								}
							}}, null),
							l("img", {src: "./icons/cut.svg", class:"icon-action", "title": "Cut folder", events: {
								click: (e) => {
									Data.app.cut(e.target)
								}
							}}, null)
						)
					))
				}
			});

			Data.app.directory.forEach(function (el) {
				if (!el.isDir) {
					tabRender.push(l("tr", {"class": "file", "data-element": el.name}, 
						l("td", {"data-label": "File"},
							l("img", {src: "./icons/" + getFileImage(el.name), style: "display: table-cell; vertical-align: text-top;"}, null),
							" " + el.name
						),
						l("td", {"data-label": "Size"}, formatByteSize(el.size)),
						l("td", {style: "text-align:right", "data-label": "Actions"}, 
							l("img", {src: "./icons/file-x.svg", class:"icon-action", "title": "Remove file", events: {
								click: (e) => {
									Data.app.rmRequest(e.target)
								}
							}}, null),
							l("img", {src: "./icons/edit.svg", class:"icon-action", "title": "Modify file", events: {
								click: (e) => {
									Data.app.edit(e.target)
								}
							}}, null),
							l("img", {src: "./icons/rename.svg", class:"icon-action", "title": "Rename file", events: {
								click: (e) => {
									Data.app.rename(e.target)
								}
							}}, null),
							l("a", {"download": el.name, href: "./api/files/get?login=" + getLogin() + "&token=" + getToken() + "&path=" + path + "/" + el.name},
								l("img", {src: "./icons/download.svg", class:"icon-action", "title": "Download file"}, null)
							),
							l("img", {src: "./icons/cut.svg", class:"icon-action", "title": "Cut file", events: {
								click: (e) => {
									Data.app.cut(e.target)
								}
							}}, null)
						)
					))
				}
			});

			l.renderElement(document.getElementById("app-display-tab"), l("tbody", {}, ...tabRender))
		},
		lsRequest: function() {
			l.requests.makej("GET", "./api/files/ls",  {
				query: {
					login: getLogin(),
					token: getToken(),
					path: path
				}
			})
			.then(function(data) {
				if (data.status == "success") {
					Data.app.directory = data.directory
					Data.app.renderTab()
				} else {
					window.alert(data.message + "\nYou can log out, and retry.")
				}
			})
		},
		newFolder: function() {
			let directoryName = window.prompt("Create a directory on path : " + (path != "" ? path : "/"))

			if (directoryName == null) {
				return
			}

			l.requests.makej("GET", "./api/files/mkdir", {
				query: {
					login: getLogin(),
					token: getToken(),
					path: path + "/" + directoryName
				}
			}).then(data => {
				if (data.status == "success") {
					l.routes.reload()
				} else {
					window.alert(data.message)
				}
			})
		},
		newFile: function() {
			let fileName = window.prompt("Create a file on path : " + (path != "" ? path : "/"))
			
			if (fileName == null) {
				return
			}
			
			l.requests.makej("GET", "./api/files/touch", {
				query: {
					login: getLogin(),
					token: getToken(),
					path: path + "/" + fileName
				}
			}).then(data => {
				if (data.status == "success") {
					l.routes.reload()
				} else {
					window.alert(data.message)
				}
			})
		},
		rmRequest: function(el) {
			if(window.confirm("Are you sure ?")) {
				l.requests.makej("GET", "./api/files/rm", {
					query: {
						login: getLogin(),
						token: getToken(),
						path: path + "/" + el.parentNode.parentNode.getAttribute("data-element")
					}
				}).then(data => {
					if (data.status == "success") {
						fadeOut(el.parentNode.parentNode)
					} else {
						window.alert(data.message)
					}
				})
			}
		},
		moveRequest: function(el) { // Not used anymore, but stay in case of
			let filePath = path + "/" + el.parentNode.parentNode.getAttribute("data-element")
			let dest = window.prompt("Move file " + filePath + " to :",  filePath)

			if (dest == null) {
				return
			}

			l.requests.makej("GET", "./api/files/mv", {
				query: {
					login: getLogin(),
					token: getToken(),
					src: filePath,
					dest: dest
				}
			}).then(data => {
				if (data.status == "success") {
					l.routes.reload()
				} else {
					window.alert(data.message)
				}
			})
		},
		cut: function (el) {
			cutPath = path + "/" + el.parentNode.parentNode.getAttribute("data-element")
			cutFileName = el.parentNode.parentNode.getAttribute("data-element")
		},
		paste: function () {
			if (cutPath != null && cutFileName != null) {
				l.requests.makej("GET", "./api/files/mv", {
					query: {
						login: getLogin(),
						token: getToken(),
						src: cutPath,
						dest: path + "/" + cutFileName
					}
				}).then(data => {
					if (data.status == "success") {
						l.routes.reload()
					} else {
						window.alert(data.message)
					}
				})
			} else {
				window.alert("Please select a file/folder to cut.")
			}
		},
		rename: function (el) {
			let fileName = el.parentNode.parentNode.getAttribute("data-element")
			let newName = window.prompt("Rename + " + fileName + " to :",  fileName)

			if (newName == null) {
				return
			}

			l.requests.makej("GET", "./api/files/mv", {
				query: {
					login: getLogin(),
					token: getToken(),
					src: path + "/" + fileName,
					dest: path + "/" + newName
				}
			}).then(data => {
				if (data.status == "success") {
					l.routes.reload()
				} else {
					window.alert(data.message)
				}
			})
		},
		edit: function(el) {
			let filePath = path + "/" + el.parentNode.parentNode.getAttribute("data-element")
			setModFile(filePath)
			window.open("mod.html", "modify", "menubar=no, statusbar=no, toolbar=no, location=no, width=800, height=600")
		}
	}
}

// Leloux object for /login route
var Login = {
	init: function() {
		if (isLoggedIn()) {
			redirect("/app", path)
		}
		Array.from(document.getElementsByClassName("app-only")).forEach(el => {
			el.style.display = "none"
		})
	},
	view: function () {
		return l("form", {events: {
				"submit": function(e) {
					e.preventDefault()
				}
			}},
				l("div", {class: "input-group vertical"},
					l("label", {"for": "login-username"}, "Username"),
					l("input", {"type": "text", "placeholder": "Username...", "id": "login-username" }),
					l("label", {"for": "login-password" }, "Password"),
					l("input", {"type": "password", "placeholder": "Password...", "id": "login-password" })
				),
				l("button", {"type": "submit", "events": {
					"click": loginRequest
				}}, "Log In")
		)
	}
}


// Leloux object for /logout route
var Logout = {
	init: function() {
		logoutRequest()
		Array.from(document.getElementsByClassName("app-only")).forEach(el => {
			el.style.display = "none"
		})
	},
	view: function () {
		return  [l("p", {}, "Déconnecté"),
			l("button", {"class": "btn btn-secondary", events: {
				"click": function() {
					redirect("/login")
				}
			}}, "Log In")]
	}
}

// Leloux object for /app route
var App = {
	init: function() {
		if (isLoggedInFast()) {
			Data.app.lsRequest()
			Array.from(document.getElementsByClassName("app-only")).forEach(el => {
				el.style.display = ""
			})
		} else {
			redirect("/login", path + "/")
		}
	},
	view: function() {
		let pathTab = []
		let parts = path.split("/")
		for (i = 1; i < parts.length; i++) {
			pathTab.push(
				l("span", {}, " / "),
				l("a", { href: "#!/app!" + encodeURI(parts.slice(0, i+1).join("/")) }, parts[i])
			)
		}
		return [
			l("pre", {},
				l("a", { href: "#!/app!/" }, "root"),
				...pathTab
			),
			l("table", {"class":"hoverable", "id": "app-display-tab"}, 
				l("thead", {},
					l("tr", {},
						l("th", {}, "Name"),
						l("th", {}, "Size"),
						l("th", {style: "text-align:right;"}, "Actions")
					)
				)
			)
		]
	}
}

var UserManager = {
	init: function() {
		if (isLoggedInFast()) {
			Array.from(document.getElementsByClassName("app-only")).forEach(el => {
				el.style.display = "none"
			})
		} else {
			redirect("/login")
		}
	},
	view: function() {
		return [
			l("form", {},)
		]
	}
}

l.routes.onroutechange = function() {
	path = l.routes.getParam()
	if (path[path.length - 1] == "/") {
		path = path.substring(0, path.length - 1)
	}
}
l.routes.def(document.getElementById("view"), "/login", {
	"/login": Login,
	"/logout": Logout,
	"/app": App,
	"/user_manager": UserManager
})