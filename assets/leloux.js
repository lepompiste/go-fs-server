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

	function renderElement(container, element) { // Render element in a specific container
		if (element == null) {
			return
		}
		
		if (Array.isArray(element)) { // if the element provided is a list of element, render all of its elements
			element.forEach(el => {
				renderElement(container, el)
			})
		} else {
			// If the element is a text element, call createTextNode, else call createElement
			const vdom = element.type == "TEXT_ELEMENT" ? document.createTextNode(element.props.nodeValue) : document.createElement(element.type)
		
			Object.keys(element.props).forEach(name => {
				if (name != "children") {
					if (name == "events") { // Events handling
						Object.keys(element.props.events).forEach(eventName => {
							vdom.addEventListener(eventName, element.props.events[eventName])
						})
					} else if (name != "nodeValue") { // Attibutes handling
						vdom.setAttribute(name, element.props[name])
					} else { // nodeValue handling
						vdom[name] = element.props[name]
					}
				}
			})

			element.props.children.forEach(child => { // Render all childs of the element
				renderElement(vdom, child)
			});

			container.appendChild(vdom) // And the element to its container
		}
	}

	function render(container, component) { // Render a component
		container.innerHTML = null // clear the container
		if (typeof component.init == "function") { // Call the init functin at each render
			component.init()
		}
		if (typeof component.view == "function") { // Then call the renderElement function to draw, getting the elements to draw with the view function
			renderElement(container, component.view())
		}
	}

	function mount(container, component) { // Mount a component to a selected mountpoint (container)
		toUpdate.forEach(mountElement => { // If a component is already mounted at the mountpoint, remove it from the update queue
			if (container == mountElement[0]) {
				toUpdate.splice(toUpdate.indexOf(mountElement))
			}
		})
		toUpdate.push([container, component]) // Add the new component at the end of the update queue
		render(container, component) // Then render the element
	}

	function redrawAll() { // redraw all mounted components
		toUpdate.forEach(el => {
			render(el[0], el[1])
		})
	}

	function getOngoingRedraw() { // return mounted components, that are eligible to redraw
		return toUpdate
	}

	var routes = {
		symbol: "#!", // symbol that define a route after
		paramSymbol: "!", // symbol that define the parameter after
		defaultRoute: undefined, // default route to go if no one is provided
		mountpoint: undefined, // DOM element in which the route will be mounted
		routes: {}, // stores the maching routes, mountpoints and components
		loaded: undefined, // stores which route is currently displayed
		mount: true, // define if the route is mounted or simply rendered

		getParam: function () {
			split = window.location.hash.split(routes.paramSymbol)
			param = split.length > 2 ? split.slice(2).join(routes.paramSymbol) : ""
			return decodeURI(param)
		},

		load: function(route) {
			if (route === null) { // if route is not known, display 404 error
				render(routes.mountpoint, {view:function(){return l("p",{},"404 error")}})
			} else if (route === undefined) { // if route is not provided, display default route if it exists
				if (routes.routes[routes.defaultRoute] != undefined) {
					routes.goto(routes.defaultRoute) // no need to check for param, because if there is not route provided, there is no param
				}
			} else if (routes.routes[route] != undefined) { // else, mount or render the component
				if (routes.mount) {
					mount(routes.mountpoint, routes.routes[route])
				} else {
					render(routes.mountpoint, routes.routes[route])
				}
				routes.loaded = route // and set the new loaded route
			} 
		},

		// reload the displayed compnent
		reload: function () {
			routes.load(routes.resolve())
		},

		// Used to define the routes
		/*
		 *	l.routes.def(MOUNTPOINT, DEFAULTROUTE, {
			 "/myroute1": component1,
			 "/myroute2": component2
		 })
		 *
		 *
		 */
		def: function(mountpoint, defaultRoute, _routes) {
			routes.defaultRoute = defaultRoute
			routes.mountpoint = mountpoint
			routes.routes = _routes
			routes.init()
		},

		// go to a specific route, with a specific parameter
		goto: function(route, param) {
			window.location.hash = routes.symbol + route + (param != undefined ? (routes.paramSymbol + param) : "")
		},

		/*
		 *	resolve a route
		 *		returning the route name in the routes table if the provided route match a pattern
		 *		returning null if the route name matches no pattern
		 * 		returning undifed if no route is provided
		 */
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

		onroutechange: function() {}, // Event called when the route is changed

		listener: function(e) { // Builtin method called on route change, that call the onroutechange event and load the new route
			routes.onroutechange()
			routes.load(routes.resolve())
		},

		// Init function, called once at first route load. Add a new event listener on hash change, and first call the listener
		init: function() {
			window.addEventListener("hashchange", routes.listener)
			routes.listener()
		}
	}

	var requests = {
		make: function(mode, url, props, isJSON) {
			return new Promise((resolve, reject) => {
				ps = "" // defined as string and not null, to avoid errors on toString

				if (props.query) {
					ps = new URLSearchParams(props.query)
				}

				let xhr = new XMLHttpRequest();
				xhr.open(mode, url + (props.query ? "?" : "") + ps.toString());

				if (props.headers) { // Custom headers handling
					Object.keys(props.headers).forEach(key => {
						if (props.headers[key] != null) { // if a header is null, it is not defined at all (useful to override content-type default without providing a new one)
							xhr.setRequestHeader(key, props.headers[key]);
						}
					});
					if (props.headers['Content-type'] === undefined) {
						xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded'); // default, can be overriden by props.headers
					}
				} else {
					xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded'); // default, can be overriden by props.headers
				}

				if (props.events) { // Custom xhr events handling
					Object.keys(props.events).forEach(key => {
						xhr.addEventListener(key, props.events[key]);
					});
				}

				if (props.uploadEvents) { // Custom xhr events handling (during upload)
					Object.keys(props.uploadEvents).forEach(key => {
						xhr.upload.addEventListener(key, props.uploadEvents[key]);
					});
				}

				xhr.onload = () => { // Resolve if status ok, else reject
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

				// reject if error
				xhr.onerror = () => reject(xhr.statusText);

				bodyData = null
				if (props.body != undefined) { // body handling
					if (props.useFormData) {// body is built using FormData
						bodyData = new FormData()

						Object.keys(props.body).forEach(key => {
							bodyData.append(key, props.body[key])
						})
					} else { // body is built using default application/www-x-form-urlencoded
						bodyParts = []
						
						Object.keys(props.body).forEach(key => {
							bodyParts.push(key + "=" + encodeURIComponent(props.body[key]))
						})

						bodyData = bodyParts.join("&")
					}
				}
				

				xhr.send(props.body != undefined ? bodyData : (props.bodyRaw != undefined ? props.bodyRaw : null));
			});
		},
		makej: function(mode, url, props) {
			return requests.make(mode, url, props, true)
		}
	}
	
	// Defining exports
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