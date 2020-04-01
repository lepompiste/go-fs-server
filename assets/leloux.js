;(
function(){
	toUpdate = []

	function createElement(type, props, ...children) {
		return {
			type: type,
			props: {
				...props,
				children: children.map(child => {
					return typeof child == "object" ? child : createTextElement(child)
				})
			}
		}
	}

	function createTextElement(text) {
		return {
			type: "TEXT_ELEMENT",
			props: {
				nodeValue: text,
				children: []
			}
		}
	}

	function renderElement(container, element) {
		if (element == null) {
			return
		}
		
		if (Array.isArray(element)) {
			element.forEach(el => {
				renderElement(container, el)
			})
		} else {
			const vdom = element.type == "TEXT_ELEMENT" ? document.createTextNode(element.props.nodeValue) : document.createElement(element.type)
		
			Object.keys(element.props).forEach(name => {
				if (name != "children") {
					if (name == "events") {
						Object.keys(element.props.events).forEach(eventName => {
							vdom.addEventListener(eventName, element.props.events[eventName])
						})
					} else if (name != "nodeValue") {
						vdom.setAttribute(name, element.props[name])
					} else {
						vdom[name] = element.props[name]
					}
				}
			})

			element.props.children.forEach(child => {
				renderElement(vdom, child)
			});

			container.appendChild(vdom)
		}
	}

	function render(container, component) {
		container.innerHTML = null
		if (typeof component.init == "function") {
			component.init()
		}
		if (typeof component.view == "function") {
			renderElement(container, component.view())
		}
	}

	function mount(container, component) {
		toUpdate.forEach(mountElement => {
			if (container == mountElement[0]) {
				toUpdate.splice(toUpdate.indexOf(mountElement))
			}
		})
		toUpdate.push([container, component])
		render(container, component)
	}

	function redrawAll() {
		toUpdate.forEach(el => {
			render(el[0], el[1])
		})
	}

	function getOngoingRedraw() {
		return toUpdate
	}

	var routes = {
		symbol: "#!",
		paramSymbol: "!",
		defaultRoute: undefined,
		mountpoint: undefined,
		routes: {},
		loaded: undefined,
		mount: true,

		getParam: function () {
			split = window.location.hash.split(routes.paramSymbol)
			param = split.length > 2 ? split.slice(2).join(routes.paramSymbol) : ""
			return decodeURI(param)
		},

		load: function(route) {
			if (route === null) {
				render(routes.mountpoint, {view:function(){return l("p",{},"404 error")}})
			} else if (route === undefined) {
				if (routes.routes[routes.defaultRoute] != undefined) {
					routes.goto(routes.defaultRoute) // no need to check for param, because if there is not route provided, there is no param
				}
			} else if (routes.routes[route] != undefined) {
				if (routes.mount) {
					mount(routes.mountpoint, routes.routes[route])
				} else {
					render(routes.mountpoint, routes.routes[route])
				}
				routes.loaded = route
			} 
		},

		reload: function () {
			routes.load(routes.resolve())
		},

		def: function(mountpoint, defaultRoute, _routes) {
			routes.defaultRoute = defaultRoute
			routes.mountpoint = mountpoint
			routes.routes = _routes
			routes.init()
		},

		goto: function(route, param) {
			window.location.hash = routes.symbol + route + (param != undefined ? (routes.paramSymbol + param) : "")
		},

		resolve: function() {
			var found = false
			r = null

			pathRegexp = new RegExp("^" + routes.symbol)

			if (pathRegexp.test(window.location.hash)) {
				route = window.location.hash.replace(routes.symbol, "")

				Object.keys(routes.routes).forEach(function(val) {
					routeRegexp = new RegExp("(^\\" + val + "$|^\\" + val + routes.paramSymbol + ")")
					if (routeRegexp.test(route)) {
						found = true // found a route that match the request
						r = val
						return
					}
				})

				if (!found) { // if not found, return null
					return null
				}
				return r
			}
			return undefined // if not provided, returl undefined
		},

		onroutechange: function() {},
		listener: function(e) {
			routes.onroutechange()
			routes.load(routes.resolve())
		},
		init: function() {
			window.addEventListener("hashchange", routes.listener)
			routes.listener()
		}
	}

	var requests = {
		make: function(mode, url, props, isJSON) {
			return new Promise((resolve, reject) => {
				ps = ""
				if (props.query) {
					ps = new URLSearchParams(props.query)
				}
				let xhr = new XMLHttpRequest();
				xhr.open(mode, url + (props.query ? "?" : "") + ps.toString());

				xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded'); // default, can be overriden by props.headers

				if (props.headers) {
					Object.keys(props.headers).forEach(key => {
						xhr.setRequestHeader(key, props.headers[key]);
					});
				}
				xhr.onload = () => {
					if (xhr.status >= 200 && xhr.status < 300) {
						if (isJSON) {
							resolve(JSON.parse(xhr.response))
						} else {
							resolve(xhr.response);
						}
					} else {
						reject(xhr.statusText);
					}
				};
				xhr.onerror = () => reject(xhr.statusText);
				bodyParts = []
				if (props.body != undefined) {
					Object.keys(props.body).forEach(key => {
						bodyParts.push(key + "=" + encodeURIComponent(props.body[key]))
					})
				}
				xhr.send(props.body != undefined ? bodyParts.join("&") : (props.bodyRaw != undefined ? props.bodyRaw : null));
			});
		},
		makej: function(mode, url, props) {
			return requests.make(mode, url, props, true)
		}
	}
	

	Leloux = createElement
	Leloux.createElement = createElement
	Leloux.createTextElement = createTextElement
	Leloux.renderElement = renderElement
	Leloux.render = render
	Leloux.mount = mount
	Leloux.redrawAll = redrawAll
	Leloux.getOngoingRedraw = getOngoingRedraw
	Leloux.routes = routes
	Leloux.requests = requests

	window.Leloux = Leloux
	window.l = Leloux
})()