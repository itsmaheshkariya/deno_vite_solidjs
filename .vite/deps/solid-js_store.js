import {
  $PROXY,
  $TRACK,
  DEV,
  batch,
  createSignal,
  getListener
} from "./chunk-ZHL5TDWT.js";

// node_modules/.deno/solid-js@1.6.11/node_modules/solid-js/store/dist/dev.js
var $RAW = Symbol("store-raw");
var $NODE = Symbol("store-node");
var $NAME = Symbol("store-name");
function wrap$1(value, name) {
  let p = value[$PROXY];
  if (!p) {
    Object.defineProperty(value, $PROXY, {
      value: p = new Proxy(value, proxyTraps$1)
    });
    if (!Array.isArray(value)) {
      const keys = Object.keys(value), desc = Object.getOwnPropertyDescriptors(value);
      for (let i = 0, l = keys.length; i < l; i++) {
        const prop = keys[i];
        if (desc[prop].get) {
          Object.defineProperty(value, prop, {
            enumerable: desc[prop].enumerable,
            get: desc[prop].get.bind(p)
          });
        }
      }
    }
    if (name)
      Object.defineProperty(value, $NAME, {
        value: name
      });
  }
  return p;
}
function isWrappable(obj) {
  let proto;
  return obj != null && typeof obj === "object" && (obj[$PROXY] || !(proto = Object.getPrototypeOf(obj)) || proto === Object.prototype || Array.isArray(obj));
}
function unwrap(item, set = /* @__PURE__ */ new Set()) {
  let result, unwrapped, v, prop;
  if (result = item != null && item[$RAW])
    return result;
  if (!isWrappable(item) || set.has(item))
    return item;
  if (Array.isArray(item)) {
    if (Object.isFrozen(item))
      item = item.slice(0);
    else
      set.add(item);
    for (let i = 0, l = item.length; i < l; i++) {
      v = item[i];
      if ((unwrapped = unwrap(v, set)) !== v)
        item[i] = unwrapped;
    }
  } else {
    if (Object.isFrozen(item))
      item = Object.assign({}, item);
    else
      set.add(item);
    const keys = Object.keys(item), desc = Object.getOwnPropertyDescriptors(item);
    for (let i = 0, l = keys.length; i < l; i++) {
      prop = keys[i];
      if (desc[prop].get)
        continue;
      v = item[prop];
      if ((unwrapped = unwrap(v, set)) !== v)
        item[prop] = unwrapped;
    }
  }
  return item;
}
function getDataNodes(target) {
  let nodes = target[$NODE];
  if (!nodes)
    Object.defineProperty(target, $NODE, {
      value: nodes = {}
    });
  return nodes;
}
function getDataNode(nodes, property, value) {
  return nodes[property] || (nodes[property] = createDataNode(value));
}
function proxyDescriptor$1(target, property) {
  const desc = Reflect.getOwnPropertyDescriptor(target, property);
  if (!desc || desc.get || !desc.configurable || property === $PROXY || property === $NODE || property === $NAME)
    return desc;
  delete desc.value;
  delete desc.writable;
  desc.get = () => target[$PROXY][property];
  return desc;
}
function trackSelf(target) {
  if (getListener()) {
    const nodes = getDataNodes(target);
    (nodes._ || (nodes._ = createDataNode()))();
  }
}
function ownKeys(target) {
  trackSelf(target);
  return Reflect.ownKeys(target);
}
function createDataNode(value) {
  const [s, set] = createSignal(value, {
    equals: false,
    internal: true
  });
  s.$ = set;
  return s;
}
var proxyTraps$1 = {
  get(target, property, receiver) {
    if (property === $RAW)
      return target;
    if (property === $PROXY)
      return receiver;
    if (property === $TRACK) {
      trackSelf(target);
      return receiver;
    }
    const nodes = getDataNodes(target);
    const tracked = nodes.hasOwnProperty(property);
    let value = tracked ? nodes[property]() : target[property];
    if (property === $NODE || property === "__proto__")
      return value;
    if (!tracked) {
      const desc = Object.getOwnPropertyDescriptor(target, property);
      if (getListener() && (typeof value !== "function" || target.hasOwnProperty(property)) && !(desc && desc.get))
        value = getDataNode(nodes, property, value)();
    }
    return isWrappable(value) ? wrap$1(value, target[$NAME] && `${target[$NAME]}:${property.toString()}`) : value;
  },
  has(target, property) {
    if (property === $RAW || property === $PROXY || property === $TRACK || property === $NODE || property === "__proto__")
      return true;
    this.get(target, property, target);
    return property in target;
  },
  set() {
    console.warn("Cannot mutate a Store directly");
    return true;
  },
  deleteProperty() {
    console.warn("Cannot mutate a Store directly");
    return true;
  },
  ownKeys,
  getOwnPropertyDescriptor: proxyDescriptor$1
};
function setProperty(state, property, value, deleting = false) {
  if (!deleting && state[property] === value)
    return;
  const prev = state[property], len = state.length;
  if (globalThis._$onStoreNodeUpdate)
    globalThis._$onStoreNodeUpdate(state, property, value, prev);
  if (value === void 0)
    delete state[property];
  else
    state[property] = value;
  let nodes = getDataNodes(state), node;
  if (node = getDataNode(nodes, property, prev))
    node.$(() => value);
  if (Array.isArray(state) && state.length !== len)
    (node = getDataNode(nodes, "length", len)) && node.$(state.length);
  (node = nodes._) && node.$();
}
function mergeStoreNode(state, value) {
  const keys = Object.keys(value);
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    setProperty(state, key, value[key]);
  }
}
function updateArray(current, next) {
  if (typeof next === "function")
    next = next(current);
  next = unwrap(next);
  if (Array.isArray(next)) {
    if (current === next)
      return;
    let i = 0, len = next.length;
    for (; i < len; i++) {
      const value = next[i];
      if (current[i] !== value)
        setProperty(current, i, value);
    }
    setProperty(current, "length", len);
  } else
    mergeStoreNode(current, next);
}
function updatePath(current, path, traversed = []) {
  let part, prev = current;
  if (path.length > 1) {
    part = path.shift();
    const partType = typeof part, isArray = Array.isArray(current);
    if (Array.isArray(part)) {
      for (let i = 0; i < part.length; i++) {
        updatePath(current, [part[i]].concat(path), traversed);
      }
      return;
    } else if (isArray && partType === "function") {
      for (let i = 0; i < current.length; i++) {
        if (part(current[i], i))
          updatePath(current, [i].concat(path), traversed);
      }
      return;
    } else if (isArray && partType === "object") {
      const {
        from = 0,
        to = current.length - 1,
        by = 1
      } = part;
      for (let i = from; i <= to; i += by) {
        updatePath(current, [i].concat(path), traversed);
      }
      return;
    } else if (path.length > 1) {
      updatePath(current[part], path, [part].concat(traversed));
      return;
    }
    prev = current[part];
    traversed = [part].concat(traversed);
  }
  let value = path[0];
  if (typeof value === "function") {
    value = value(prev, traversed);
    if (value === prev)
      return;
  }
  if (part === void 0 && value == void 0)
    return;
  value = unwrap(value);
  if (part === void 0 || isWrappable(prev) && isWrappable(value) && !Array.isArray(value)) {
    mergeStoreNode(prev, value);
  } else
    setProperty(current, part, value);
}
function createStore(...[store, options]) {
  const unwrappedStore = unwrap(store || {});
  const isArray = Array.isArray(unwrappedStore);
  if (typeof unwrappedStore !== "object" && typeof unwrappedStore !== "function")
    throw new Error(`Unexpected type ${typeof unwrappedStore} received when initializing 'createStore'. Expected an object.`);
  const wrappedStore = wrap$1(unwrappedStore, options && options.name || DEV.hashValue(unwrappedStore));
  {
    const name = options && options.name || DEV.hashValue(unwrappedStore);
    DEV.registerGraph(name, {
      value: unwrappedStore
    });
  }
  function setStore(...args) {
    batch(() => {
      isArray && args.length === 1 ? updateArray(unwrappedStore, args[0]) : updatePath(unwrappedStore, args);
    });
  }
  return [wrappedStore, setStore];
}
function proxyDescriptor(target, property) {
  const desc = Reflect.getOwnPropertyDescriptor(target, property);
  if (!desc || desc.get || desc.set || !desc.configurable || property === $PROXY || property === $NODE || property === $NAME)
    return desc;
  delete desc.value;
  delete desc.writable;
  desc.get = () => target[$PROXY][property];
  desc.set = (v) => target[$PROXY][property] = v;
  return desc;
}
var proxyTraps = {
  get(target, property, receiver) {
    if (property === $RAW)
      return target;
    if (property === $PROXY)
      return receiver;
    if (property === $TRACK) {
      trackSelf(target);
      return receiver;
    }
    const nodes = getDataNodes(target);
    const tracked = nodes.hasOwnProperty(property);
    let value = tracked ? nodes[property]() : target[property];
    if (property === $NODE || property === "__proto__")
      return value;
    if (!tracked) {
      const desc = Object.getOwnPropertyDescriptor(target, property);
      const isFunction = typeof value === "function";
      if (getListener() && (!isFunction || target.hasOwnProperty(property)) && !(desc && desc.get))
        value = getDataNode(nodes, property, value)();
      else if (value != null && isFunction && value === Array.prototype[property]) {
        return (...args) => batch(() => Array.prototype[property].apply(receiver, args));
      }
    }
    return isWrappable(value) ? wrap(value, target[$NAME] && `${target[$NAME]}:${property.toString()}`) : value;
  },
  has(target, property) {
    if (property === $RAW || property === $PROXY || property === $TRACK || property === $NODE || property === "__proto__")
      return true;
    this.get(target, property, target);
    return property in target;
  },
  set(target, property, value) {
    batch(() => setProperty(target, property, unwrap(value)));
    return true;
  },
  deleteProperty(target, property) {
    batch(() => setProperty(target, property, void 0, true));
    return true;
  },
  ownKeys,
  getOwnPropertyDescriptor: proxyDescriptor
};
function wrap(value, name) {
  let p = value[$PROXY];
  if (!p) {
    Object.defineProperty(value, $PROXY, {
      value: p = new Proxy(value, proxyTraps)
    });
    const keys = Object.keys(value), desc = Object.getOwnPropertyDescriptors(value);
    for (let i = 0, l = keys.length; i < l; i++) {
      const prop = keys[i];
      if (desc[prop].get) {
        const get = desc[prop].get.bind(p);
        Object.defineProperty(value, prop, {
          get
        });
      }
      if (desc[prop].set) {
        const og = desc[prop].set, set = (v) => batch(() => og.call(p, v));
        Object.defineProperty(value, prop, {
          set
        });
      }
    }
    if (name)
      Object.defineProperty(value, $NAME, {
        value: name
      });
  }
  return p;
}
function createMutable(state, options) {
  const unwrappedStore = unwrap(state || {});
  if (typeof unwrappedStore !== "object" && typeof unwrappedStore !== "function")
    throw new Error(`Unexpected type ${typeof unwrappedStore} received when initializing 'createMutable'. Expected an object.`);
  const wrappedStore = wrap(unwrappedStore, options && options.name || DEV.hashValue(unwrappedStore));
  {
    const name = options && options.name || DEV.hashValue(unwrappedStore);
    DEV.registerGraph(name, {
      value: unwrappedStore
    });
  }
  return wrappedStore;
}
function modifyMutable(state, modifier) {
  batch(() => modifier(unwrap(state)));
}
var $ROOT = Symbol("store-root");
function applyState(target, parent, property, merge, key) {
  const previous = parent[property];
  if (target === previous)
    return;
  if (!isWrappable(target) || !isWrappable(previous) || key && target[key] !== previous[key]) {
    if (target !== previous) {
      if (property === $ROOT)
        return target;
      setProperty(parent, property, target);
    }
    return;
  }
  if (Array.isArray(target)) {
    if (target.length && previous.length && (!merge || key && target[0] && target[0][key] != null)) {
      let i, j, start, end, newEnd, item, newIndicesNext, keyVal;
      for (start = 0, end = Math.min(previous.length, target.length); start < end && (previous[start] === target[start] || key && previous[start] && target[start] && previous[start][key] === target[start][key]); start++) {
        applyState(target[start], previous, start, merge, key);
      }
      const temp = new Array(target.length), newIndices = /* @__PURE__ */ new Map();
      for (end = previous.length - 1, newEnd = target.length - 1; end >= start && newEnd >= start && (previous[end] === target[newEnd] || key && previous[start] && target[start] && previous[end][key] === target[newEnd][key]); end--, newEnd--) {
        temp[newEnd] = previous[end];
      }
      if (start > newEnd || start > end) {
        for (j = start; j <= newEnd; j++)
          setProperty(previous, j, target[j]);
        for (; j < target.length; j++) {
          setProperty(previous, j, temp[j]);
          applyState(target[j], previous, j, merge, key);
        }
        if (previous.length > target.length)
          setProperty(previous, "length", target.length);
        return;
      }
      newIndicesNext = new Array(newEnd + 1);
      for (j = newEnd; j >= start; j--) {
        item = target[j];
        keyVal = key && item ? item[key] : item;
        i = newIndices.get(keyVal);
        newIndicesNext[j] = i === void 0 ? -1 : i;
        newIndices.set(keyVal, j);
      }
      for (i = start; i <= end; i++) {
        item = previous[i];
        keyVal = key && item ? item[key] : item;
        j = newIndices.get(keyVal);
        if (j !== void 0 && j !== -1) {
          temp[j] = previous[i];
          j = newIndicesNext[j];
          newIndices.set(keyVal, j);
        }
      }
      for (j = start; j < target.length; j++) {
        if (j in temp) {
          setProperty(previous, j, temp[j]);
          applyState(target[j], previous, j, merge, key);
        } else
          setProperty(previous, j, target[j]);
      }
    } else {
      for (let i = 0, len = target.length; i < len; i++) {
        applyState(target[i], previous, i, merge, key);
      }
    }
    if (previous.length > target.length)
      setProperty(previous, "length", target.length);
    return;
  }
  const targetKeys = Object.keys(target);
  for (let i = 0, len = targetKeys.length; i < len; i++) {
    applyState(target[targetKeys[i]], previous, targetKeys[i], merge, key);
  }
  const previousKeys = Object.keys(previous);
  for (let i = 0, len = previousKeys.length; i < len; i++) {
    if (target[previousKeys[i]] === void 0)
      setProperty(previous, previousKeys[i], void 0);
  }
}
function reconcile(value, options = {}) {
  const {
    merge,
    key = "id"
  } = options, v = unwrap(value);
  return (state) => {
    if (!isWrappable(state) || !isWrappable(v))
      return v;
    const res = applyState(v, {
      [$ROOT]: state
    }, $ROOT, merge, key);
    return res === void 0 ? state : res;
  };
}
var producers = /* @__PURE__ */ new WeakMap();
var setterTraps = {
  get(target, property) {
    if (property === $RAW)
      return target;
    const value = target[property];
    let proxy;
    return isWrappable(value) ? producers.get(value) || (producers.set(value, proxy = new Proxy(value, setterTraps)), proxy) : value;
  },
  set(target, property, value) {
    setProperty(target, property, unwrap(value));
    return true;
  },
  deleteProperty(target, property) {
    setProperty(target, property, void 0, true);
    return true;
  }
};
function produce(fn) {
  return (state) => {
    if (isWrappable(state)) {
      let proxy;
      if (!(proxy = producers.get(state))) {
        producers.set(state, proxy = new Proxy(state, setterTraps));
      }
      fn(proxy);
    }
    return state;
  };
}
var DEV2 = {
  $NAME,
  $NODE,
  isWrappable
};
export {
  $RAW,
  DEV2 as DEV,
  createMutable,
  createStore,
  modifyMutable,
  produce,
  reconcile,
  unwrap
};
//# sourceMappingURL=solid-js_store.js.map
