/**
* Seleku Create and maintenance By Ari Susanto 
* check my github at 
* @link https://github.com/daberpro 

*/
// node_modules/seleku-v3.0/seleku-core/Node.js
var Node = class {
  static Render(Component, target) {
    if (Component instanceof HTMLElement) {
      if (Component instanceof HTMLElement) {
        target.appendChild(Component);
      }
      if (Component instanceof Array) {
        for (let x of Component) {
          if (x instanceof HTMLElement)
            target.appendChild(x);
        }
      }
      return Component;
    } else {
      if (Component.element instanceof HTMLElement) {
        target.appendChild(Component.element);
      }
      if (Component.element instanceof Array) {
        for (let x of Component.element) {
          if (x instanceof HTMLElement)
            target.appendChild(x);
        }
      }
      return Component;
    }
  }
  static RenderBefore(Component, target) {
    if (Component instanceof HTMLElement) {
      if (Component instanceof HTMLElement) {
        target.insertBefore(Component, target.firstChild);
      }
      if (Component instanceof Array) {
        for (let x of Component) {
          if (x instanceof HTMLElement)
            target.insertBefore(x, target.firstChild);
        }
      }
      return Component;
    } else {
      if (Component.element instanceof HTMLElement) {
        target.insertBefore(Component.element, target.firstChild);
      }
      if (Component.element instanceof Array) {
        for (let x of Component.element) {
          if (x instanceof HTMLElement)
            target.insertBefore(x, target.firstChild);
        }
      }
      return Component;
    }
  }
  constructor(name, content, attribute) {
  }
  createElement(name) {
    const Component = document.createElement(name);
    return Component;
  }
  createAttribute(Component, attribute) {
    if (Component instanceof HTMLElement && !(attribute instanceof Object && !(attribute instanceof Array))) {
      return 0;
    }
    let template = "";
    for (let x in attribute) {
      if (typeof attribute[x] === "function") {
        Component[x.replace(/\$\$\$\_/igm, "")] = attribute[x];
      } else {
        const _RealAttrContext = new Function("$$$___attr", "Component", `
					const {${Object.keys(attribute).map((e) => {
          if (e === "class") {
            return "$_class";
          }
          return e;
        })}} = $$$___attr;

	        try{
	          if(typeof $$$_${x} !== 'function' && $$$_${x}){

	          	Component.setAttribute('${x}', $$$_${x});

	          }else{
				
				Component.setAttribute('${x}', '${attribute[x]}');

	          }
	        }catch(e){
	          if(typeof ${x.replace(/class/igm, "$$_$&")} !== 'function' && ${x.replace(/class/igm, "$$_$&")}){
	          	Component.setAttribute('${x}', ${x.replace(/class/igm, "$$_$&")});
	          }else{
	          	Component.setAttribute('${x}', '${attribute[x]}');
	          }
	        }
	        
				`);
        if (!/\$\$\$\_/igm.test(x)) {
          _RealAttrContext(attribute, Component);
          template += `Component.setAttribute('${x}', ${attribute[x]});`;
        }
      }
    }
    return {
      update(data) {
        const _RealAttrContext = new Function("$$$___attr", "Component", `
					const {${Object.keys({ ...attribute, ...data }).map((e) => {
          if (e === "class") {
            return "$_class";
          }
          return e;
        })}} = $$$___attr;
					${template}
				`);
        _RealAttrContext(data, Component);
      }
    };
  }
  createContent(Component, content, prop = {}, uid = void 0) {
    const context = new Text(content);
    const main = this;
    const child = /* @__PURE__ */ new Map();
    Component.appendChild(context);
    const _RealContext = new Function("props", "parent", `
					const {${Object.keys(prop).join(",")}} = props; 
					const result = \`${content}\`

					return result;
					`);
    context.replaceData(0, context.data.length, _RealContext(prop, Component));
    return {
      content,
      linked: prop,
      child,
      update(_content = content, props = { uid: main.uid }) {
        this.linked = props;
        const _RealContext2 = new Function("props", "parent", `
					const {${Object.keys({ ...prop, ...props }).join(",")}} = props; 
					const result = \`${_content}\`

					return result;
					`);
        context.replaceData(0, context.data.length, _RealContext2({ ...prop, ...props }, Component));
      },
      uid
    };
  }
  static registerContext(content, Observer2) {
    for (let x in content.linked) {
      if (x !== "uid" && x !== "condition" && x !== "loop" && x !== "async")
        Observer2.subscribe(x, (object) => {
          content.update(content.content, { ...content.linked, ...object });
        });
    }
  }
  static destroy(Component) {
    Component.remove();
  }
};

// node_modules/seleku-v3.0/seleku-core/Observer.js
var Observer = class {
  handlers = {};
  subscribe(target, fn) {
    const main = this.handlers[target];
    if (this.handlers.hasOwnProperty(target)) {
      this.handlers[target] = function(args) {
        main.call(this, args);
        fn.call(this, args);
      };
    } else {
      this.handlers[target] = fn;
    }
  }
  unsubscribe(target) {
    if (target in this.handlers) {
      delete this.handlers[target];
    }
  }
  emit(target, args) {
    if (this.handlers[target])
      return this.handlers[target](args);
  }
};

// node_modules/seleku-v3.0/seleku-core/State.js
var CreateState = class {
  object = null;
  state = null;
  constructor(object) {
    this.object = object;
    this.state = new Proxy(this.object, this.#handler());
  }
  #handler() {
    const main = this;
    const _handler = {
      set(object, prop, value) {
        object[prop] = value;
        if (prop in object) {
          main.update(prop);
          return object[prop];
        }
        return 0;
      },
      get(target, prop, receiver) {
        if (prop in target) {
          return target[prop];
        }
        return 0;
      }
    };
    return _handler;
  }
  update() {
  }
};

// node_modules/seleku-v3.0/seleku-core/ArrayWatcher.js
var ArrayWatcher = function(array, event) {
  const cache = /* @__PURE__ */ new Map();
  let once = [];
  let evaluationValue = null;
  let unshiftValue = [];
  return new Proxy(array, {
    get(target, property, receiver) {
      if (event instanceof Object && event.hasOwnProperty("watch") && property !== "length" && isNaN(parseFloat(property))) {
        cache.set("property", property);
        once[0] = "";
      } else {
        if (property !== "length")
          event.watch(property, "get");
      }
      return target[property];
    },
    set(target, property, value, receiver) {
      target[property] = value;
      if (once[0] !== cache.get("property") && cache.get("property") !== "unshift") {
        once[0] = cache.get("property");
        event.watch(cache.get("property"), "set", target, property);
      } else if (cache.get("property") === "unshift") {
        evaluationValue = value;
      }
      if (evaluationValue !== target.length) {
        unshiftValue.unshift(evaluationValue);
      } else {
        event.watch(cache.get("property"), "set", unshiftValue, 0);
      }
      ;
      return true;
    }
  });
};

// node_modules/seleku-v3.0/seleku-core/index.js
var Seleku = new Node();
Array.prototype.update = function(index, value) {
  this[index] = value;
  return index;
};

// item.selek
var Card = ({ quotes }, $$_parent) => {
  let _Observer = new Observer();
  const _State = class extends CreateState {
    constructor(args) {
      super(args);
    }
    update(prop) {
      _Observer.emit(prop, this.object);
    }
  };
  let $$State = new _State({});
  const div2295 = Seleku.createElement("div");
  const div2295_attribute = Seleku.createAttribute(div2295, {
    "class": "card"
  });
  const div2295_content = Seleku.createContent(div2295, " ", {});
  Node.registerContext(div2295_content, _Observer);
  const b2296 = Seleku.createElement("b");
  const b2296_attribute = Seleku.createAttribute(b2296, {
    "class": "quotes-title"
  });
  const b2296_content = Seleku.createContent(b2296, " ${quotes.name} ", {
    quotes
  });
  Node.registerContext(b2296_content, _Observer);
  Node.Render(b2296, div2295);
  const p2297 = Seleku.createElement("p");
  const p2297_attribute = Seleku.createAttribute(p2297, {
    "class": "quotes"
  });
  const p2297_content = Seleku.createContent(p2297, " ${quotes.description} ", {
    quotes
  });
  Node.registerContext(p2297_content, _Observer);
  Node.Render(p2297, div2295);
  return {
    element: div2295,
    update(content, data) {
      div2295_attribute.update(data);
      div2295_content.update(content, data);
      b2296_attribute.update(data);
      b2296_content.update(content, data);
      p2297_attribute.update(data);
      p2297_content.update(content, data);
    }
  };
  ;
};
var Item = ($$_parent) => {
  let _Observer = new Observer();
  const _State = class extends CreateState {
    constructor(args) {
      super(args);
    }
    update(prop) {
      _Observer.emit(prop, this.object);
    }
  };
  let $$State = new _State({});
  let item = [{
    name: "Docs",
    description: "read my documentation here",
    link() {
      location.href = "https://docs.seleku.my.id";
    }
  }, {
    name: "About Me",
    description: "wanna know more about me?",
    link() {
      location.href = "https://www.youtube.com/channel/UCFQIEemKcIXhwBYpSYH0HYg";
    }
  }, {
    name: "Github",
    description: "contribute to my project",
    link() {
      location.href = "https://github.com/daberpro";
    }
  }];
  $$State.state.item = item;
  const div2298 = Seleku.createElement("div");
  const div2298_attribute = Seleku.createAttribute(div2298, {
    "class": "menu"
  });
  const div2298_content = Seleku.createContent(div2298, " ", {});
  Node.registerContext(div2298_content, _Observer);
  const ArrayOfComponent_$$Card_component = [];
  const $$Template_Function_$$Card_component = ({ target, data, index }, Node2) => {
    let _item = data[index];
    const $$Card_component = Node2.Render(Card({
      "quotes": _item
    }, div2298), div2298);
    _Observer.subscribe("_item", (data2) => $$Card_component.update(void 0, data2));
    return {
      update(props) {
        $$Card_component.update(void 0, {
          quotes: props["_item"],
          ...props
        });
      },
      destroy() {
        Node2.destroy($$Card_component.element);
      }
    };
  };
  const loopHandler_$$Card_component = {
    push(props) {
      ArrayOfComponent_$$Card_component.push($$Template_Function_$$Card_component(props, Node));
    },
    unshift(props) {
      ArrayOfComponent_$$Card_component.unshift($$Template_Function_$$Card_component({
        ...props,
        index: 0
      }, {
        Render: Node.RenderBefore,
        destroy: Node.destroy
      }));
    },
    shift(props) {
      if (ArrayOfComponent_$$Card_component.length > 0) {
        ArrayOfComponent_$$Card_component[0].destroy(props);
        ArrayOfComponent_$$Card_component.shift();
      }
    },
    pop(props) {
      const { index, data } = props;
      if (ArrayOfComponent_$$Card_component.length > 0) {
        ArrayOfComponent_$$Card_component[data.length].destroy(props);
        ArrayOfComponent_$$Card_component.pop();
      }
    },
    update(props) {
      const { data, index } = props;
      if (ArrayOfComponent_$$Card_component.length > 0)
        ArrayOfComponent_$$Card_component[index].update({
          _item: data[index]
        });
    }
  };
  for (let x in loopHandler_$$Card_component) {
    _Observer.subscribe("_item_" + x, loopHandler_$$Card_component[x]);
  }
  for (let $$LoopData in item) {
    if (Number.isInteger(parseInt($$LoopData))) {
      ArrayOfComponent_$$Card_component.push($$Template_Function_$$Card_component({
        target: null,
        data: item,
        index: parseInt($$LoopData)
      }, Node));
    }
  }
  item = ArrayWatcher(item, {
    watch(target, from, object, property) {
      if (from === "set") {
        _Observer.emit("_item_" + target, {
          data: object,
          index: property,
          target
        });
      }
      return 1;
    }
  });
  return {
    element: div2298,
    update(content, data) {
      div2298_attribute.update(data);
      div2298_content.update(content, data);
    }
  };
  ;
};

// seleku-kit.png
var seleku_kit_default = "./assets/seleku-kit-UAMSTX3X.png";

// navbar.selek
var Navbar = ($$_parent) => {
  let _Observer = new Observer();
  const _State = class extends CreateState {
    constructor(args) {
      super(args);
    }
    update(prop) {
      _Observer.emit(prop, this.object);
    }
  };
  let $$State = new _State({});
  const div2289 = Seleku.createElement("div");
  const div2289_attribute = Seleku.createAttribute(div2289, {
    "class": "navbar"
  });
  const div2289_content = Seleku.createContent(div2289, " ", {});
  Node.registerContext(div2289_content, _Observer);
  const div2290 = Seleku.createElement("div");
  const div2290_attribute = Seleku.createAttribute(div2290, {
    "class": "left"
  });
  const div2290_content = Seleku.createContent(div2290, " ", {});
  Node.registerContext(div2290_content, _Observer);
  Node.Render(div2290, div2289);
  const img2291 = Seleku.createElement("img");
  const img2291_attribute = Seleku.createAttribute(img2291, {
    "class": "logo",
    "src": "logo",
    "$$$_src": seleku_kit_default
  });
  const img2291_content = Seleku.createContent(img2291, "", {});
  Node.registerContext(img2291_content, _Observer);
  Node.Render(img2291, div2290);
  _Observer.subscribe("logo", (data) => img2291_attribute.update(data));
  const b2292 = Seleku.createElement("b");
  const b2292_attribute = Seleku.createAttribute(b2292, {});
  const b2292_content = Seleku.createContent(b2292, " Seleku v3.0 ", {});
  Node.registerContext(b2292_content, _Observer);
  Node.Render(b2292, div2290);
  const div2293 = Seleku.createElement("div");
  const div2293_attribute = Seleku.createAttribute(div2293, {
    "class": "right"
  });
  const div2293_content = Seleku.createContent(div2293, " ", {});
  Node.registerContext(div2293_content, _Observer);
  Node.Render(div2293, div2289);
  const a2294 = Seleku.createElement("a");
  const a2294_attribute = Seleku.createAttribute(a2294, {
    "href": "https://sociabuzz.com/daberdev/tribe"
  });
  const a2294_content = Seleku.createContent(a2294, "Buy me coffe \u2615", {});
  Node.registerContext(a2294_content, _Observer);
  Node.Render(a2294, div2293);
  return {
    element: div2289,
    update(content, data) {
      div2289_attribute.update(data);
      div2289_content.update(content, data);
      div2290_attribute.update(data);
      div2290_content.update(content, data);
      img2291_attribute.update(data);
      img2291_content.update(content, data);
      b2292_attribute.update(data);
      b2292_content.update(content, data);
      div2293_attribute.update(data);
      div2293_content.update(content, data);
      a2294_attribute.update(data);
      a2294_content.update(content, data);
    }
  };
  ;
};

// header.selek
var Header = ($$_parent) => {
  let _Observer = new Observer();
  const _State = class extends CreateState {
    constructor(args) {
      super(args);
    }
    update(prop) {
      _Observer.emit(prop, this.object);
    }
  };
  let $$State = new _State({});
  const div2281 = Seleku.createElement("div");
  const div2281_attribute = Seleku.createAttribute(div2281, {
    "class": "container header"
  });
  const div2281_content = Seleku.createContent(div2281, " ", {});
  Node.registerContext(div2281_content, _Observer);
  const $$Navbar_component = Node.Render(Navbar({}, div2281), div2281);
  const h12283 = Seleku.createElement("h1");
  const h12283_attribute = Seleku.createAttribute(h12283, {
    "class": "title"
  });
  const h12283_content = Seleku.createContent(h12283, "Welcome To Seleku", {});
  Node.registerContext(h12283_content, _Observer);
  Node.Render(h12283, div2281);
  const h32284 = Seleku.createElement("h3");
  const h32284_attribute = Seleku.createAttribute(h32284, {
    "class": "subtitle"
  });
  const h32284_content = Seleku.createContent(h32284, "lightweight web framework and extremely fast", {});
  Node.registerContext(h32284_content, _Observer);
  Node.Render(h32284, div2281);
  const $$Item_component = Node.Render(Item({}, div2281), div2281);
  return {
    element: div2281,
    update(content, data) {
      div2281_attribute.update(data);
      div2281_content.update(content, data);
      h12283_attribute.update(data);
      h12283_content.update(content, data);
      h32284_attribute.update(data);
      h32284_content.update(content, data);
    }
  };
  ;
};

// content.selek
var Content = ($$_parent) => {
  let _Observer = new Observer();
  const _State = class extends CreateState {
    constructor(args) {
      super(args);
    }
    update(prop) {
      _Observer.emit(prop, this.object);
    }
  };
  let $$State = new _State({});
  let data = [];
  $$State.state.data = data;
  fetch("https://api.github.com/repos/daberpro/seleku-v3.0/contributors", {
    method: "GET"
  }).then((e) => e.json()).then((e) => {
    for (let x of e) {
      data.push(x);
    }
  });
  const div2286 = Seleku.createElement("div");
  const div2286_attribute = Seleku.createAttribute(div2286, {
    "class": "contributor"
  });
  const div2286_content = Seleku.createContent(div2286, " ", {});
  Node.registerContext(div2286_content, _Observer);
  const ArrayOfComponent_img2288 = [];
  const $$Template_Function_img2288 = ({ target, data: data2, index }, Node2, $$_parent2) => {
    let _Observer2 = new Observer();
    const _State2 = class extends CreateState {
      constructor(args) {
        super(args);
      }
      update(prop) {
        _Observer2.emit(prop, this.object);
      }
    };
    let $$State2 = new _State2({});
    let user = data2[index];
    const h12287 = Seleku.createElement("h1");
    const h12287_attribute = Seleku.createAttribute(h12287, {});
    const h12287_content = Seleku.createContent(h12287, "Contributor", {});
    Node2.registerContext(h12287_content, _Observer2);
    Node2.Render(h12287, div2286);
    const img2288 = Seleku.createElement("img");
    const img2288_attribute = Seleku.createAttribute(img2288, {
      "alt": user.login,
      "title": user.login,
      "src": user.avatar_url
    });
    const img2288_content = Seleku.createContent(img2288, "", {});
    Node2.registerContext(img2288_content, _Observer2);
    Node2.Render(img2288, div2286);
    return {
      update(props) {
        h12287_content.update(void 0, {
          ...props
        });
        img2288_content.update(void 0, {
          ...props
        });
      },
      destroy() {
        Node2.destroy(h12287);
        Node2.destroy(img2288);
      }
    };
    return {
      element: h12287,
      update(content, data3) {
        h12287_attribute.update(data3);
        h12287_content.update(content, data3);
        img2288_attribute.update(data3);
        img2288_content.update(content, data3);
      }
    };
    ;
  };
  const loopHandler_img2288 = {
    push(props) {
      ArrayOfComponent_img2288.push($$Template_Function_img2288(props, Node));
    },
    unshift(props) {
      ArrayOfComponent_img2288.unshift($$Template_Function_img2288({
        ...props,
        index: 0
      }, {
        Render: Node.RenderBefore,
        destroy: Node.destroy
      }));
    },
    shift(props) {
      if (ArrayOfComponent_img2288.length > 0) {
        ArrayOfComponent_img2288[0].destroy(props);
        ArrayOfComponent_img2288.shift();
      }
    },
    pop(props) {
      const { index, data: data2 } = props;
      if (ArrayOfComponent_img2288.length > 0) {
        ArrayOfComponent_img2288[data2.length].destroy(props);
        ArrayOfComponent_img2288.pop();
      }
    },
    update(props) {
      const { data: data2, index } = props;
      if (ArrayOfComponent_img2288.length > 0)
        ArrayOfComponent_img2288[index].update({
          user: data2[index]
        });
    }
  };
  for (let x in loopHandler_img2288) {
    _Observer.subscribe("user_" + x, loopHandler_img2288[x]);
  }
  for (let $$LoopData in data) {
    if (Number.isInteger(parseInt($$LoopData))) {
      ArrayOfComponent_img2288.push($$Template_Function_img2288({
        target: null,
        data,
        index: parseInt($$LoopData)
      }, Node));
    }
  }
  data = ArrayWatcher(data, {
    watch(target, from, object, property) {
      if (from === "set") {
        _Observer.emit("user_" + target, {
          data: object,
          index: property,
          target
        });
      }
      return 1;
    }
  });
  return {
    element: div2286,
    update(content, data2) {
      div2286_attribute.update(data2);
      div2286_content.update(content, data2);
    }
  };
  ;
};

// app.selek
var Welcome = ($$_parent) => {
  let _Observer = new Observer();
  const _State = class extends CreateState {
    constructor(args) {
      super(args);
    }
    update(prop) {
      _Observer.emit(prop, this.object);
    }
  };
  let $$State = new _State({});
  const div2278 = Seleku.createElement("div");
  const div2278_attribute = Seleku.createAttribute(div2278, {
    "class": "content"
  });
  const div2278_content = Seleku.createContent(div2278, " ", {});
  Node.registerContext(div2278_content, _Observer);
  const $$Header_component = Node.Render(Header({}, div2278), div2278);
  const $$Content_component = Node.Render(Content({}, div2278), div2278);
  return {
    element: div2278,
    update(content, data) {
      div2278_attribute.update(data);
      div2278_content.update(content, data);
    }
  };
  ;
};
Node.Render(Welcome(), document.body);
