const storageMode = sessionStorage
var path = ""

function redirect(_route, _path) {
	l.routes.goto(_route, _path)
}

// use it to evaluate the error and display a message
function errorApp() {
	if (isLoggedInFast()) {
		if (isLoggedIn()) {
			window.alert("Error, probably path")
			path = "/"
			redirect("/app", path)
		} else {
			window.alert("Error, session expired")
			redirect("/logout")
		}
	} else {
		window.alert("Error, you aren't logged in")
		redirect("/login")
	}
}

function fadeOut(element) {
    var op = 1;  // initial opacity
    var timer = setInterval(function () {
        if (op <= 0.1){
            clearInterval(timer);
			element.style.display = 'none';
			element.parentNode.removeChild(element)
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op -= op * 0.05;
    }, 10);
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

/**
 * Check if the user is well authenticated, using api
 */
function isLoggedIn() {
	if (getLogin() != null && getToken() != null) {
		return true
	}
	return false
}

/**
 * Check if the user is well authenticated, NOT using api
 */
function isLoggedInFast() {
	if (getLogin() != null && getToken() != null) {
		return true // to fix
	}
	return false
}

function formatByteSize(size) {
	_size = size
	units = ["B", "KB", "MB", "GB"]
	unit_number = 0
	while (~~(_size / 1000) >= 1 && unit_number < 3) {
		unit_number++
		_size = ~~(_size / 1000)
	}
	return _size + " " + units[unit_number]
}

var testLoginRequest = function () {
	resp = false
	l.requests.makej("GET", "./api/session/test", {
		query: {
			login: getLogin(),
			token: getToken()
		}
	})
    .then(function(data) {
        if (data.status == "success") {
			resp = true
		}
	})
	return resp
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


// mithril data
var Data = {
	app: {
		directory: [],
		renderTab: function() {
			tabRender = []
			Data.app.directory.forEach(function (el) {
				if (el.isDir) {
					tabRender.push(l("tr", {"class": "directory", "data-element": el.name}, 
						l("td", {"scope": "row"}, l("a", {
							href: "#!/app!" + encodeURI(path) + "/" + encodeURI(el.name)
						}, el.name)),
						l("td", {}, ""),
						l("td", {style: "text-align:right"}, 
							l("img", {src: "./icons/folder-x.svg", class:"icon-action", events: {
								click: (e) => {
									Data.app.rmRequest(e.target)
								}
							}}, null)
						)
					))
				}
			});

			Data.app.directory.forEach(function (el) {
				if (!el.isDir) {
					tabRender.push(l("tr", {"class": "file", "data-element": el.name}, 
						l("td", {"scope": "row"}, el.name),
						l("td", {}, formatByteSize(el.size)),
						l("td", {style: "text-align:right"}, 
							l("img", {src: "./icons/file-x.svg", class:"icon-action", events: {
								click: (e) => {
									Data.app.rmRequest(e.target)
								}
							}}, null),
							l("img", {src: "./icons/download.svg", class:"icon-action", events: {
								click: (e) => {
									Data.app.download(e.target)
								}
							}}, null),
							l("img", {src: "./icons/edit.svg", class:"icon-action", events: {
								click: (e) => {
									Data.app.edit(e.target)
								}
							}}, null),
							l("img", {src: "./icons/move.svg", class:"icon-action", events: {
								click: (e) => {
									Data.app.move(e.target)
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
					window.alert(data.message)
				}
			})
		},
		newFolder: function() {
			directoryName = window.prompt("Create a directory on path : " + (path != "" ? path : "/"))

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
			fileName = window.prompt("Create a file on path : " + (path != "" ? path : "/"))
			
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
		}
	}
}

// mithril object for /login route
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
		return l("div", { "class": "container mt-5" },
			l("div", { "id": "formContent" },
				l("form", {events: {
					"submit": function(e) {
						e.preventDefault()
					}
				}},
					l("div", { "class": "form-group" },
						l("label", { "class": "col-form-label", "for": "login-username" },
							"Username"
						),
						l("input", { "class": "form-control", "type": "text", "placeholder": "Username...", "id": "login-username" })
					),
					l("div", { "class": "form-group" },
						l("label", { "class": "col-form-label", "for": "login-password" },
							"Password"
						),
						l("input", { "class": "form-control", "type": "password", "placeholder": "Password...", "id": "login-password" })
					),
					l("button", { "class": "btn btn-secondary", "type": "submit", "events": {
						"click": loginRequest
					}}, "Log In")
				)
			)
		)
	}
}


// mithril object for /logout route
var Logout = {
	init: function() {
		logoutRequest()
		Array.from(document.getElementsByClassName("app-only")).forEach(el => {
			el.style.display = "none"
		})
	},
	view: function () {
		return l("div", { "class": "container mt-5" }, 
			l("p", {}, "Déconnecté"),
			l("button", {"class": "btn btn-secondary", events: {
				"click": function() {
					redirect("/login")
				}
			}}, "Log In")
		)
	}
}

// mithril object for /app route
var App = {
	init: function() {
		if (isLoggedInFast()) {
			Data.app.lsRequest()
			Array.from(document.getElementsByClassName("app-only")).forEach(el => {
				el.style.display = ""
			})
		} else {
			errorApp()
		}
	},
	view: function() {
		pathTab = []
		parts = path.split("/")
		for (i = 1; i < parts.length; i++) {
			pathTab.push(
				l("span", {}, " / "),
				l("a", { href: "#!/app!" + encodeURI(parts.slice(0, i+1).join("/")) }, parts[i])
			)
		}
		return l("div", {"class": "container"},
			l("p", {}, 
				l("a", { href: "#!/app!/" }, "root"),
				...pathTab),
			l("table", {"class":"hoverable", "id": "app-display-tab"}, 
				l("thead", {},
					l("tr", {},
						l("th", {}, "Name"),
						l("th", {}, "Size"),
						l("th", {style: "text-align:right;"}, "Actions")
					)
				)
			)
		)
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
	"/app": App
})