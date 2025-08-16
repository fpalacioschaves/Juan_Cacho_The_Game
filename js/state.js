"use strict";

const State = (function(){
  const KEY = "STATE_V1";
  let data = null;

  function defaultState(){
    return {
      currentSceneId: null,
      inventory: [],
      flags: {}
    };
  }

  function load(){
    if (data) return data;
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) data = defaultState();
      else data = JSON.parse(raw);
    } catch (_) {
      data = defaultState();
    }
    save();
    return data;
  }

  function save(){
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch(_){}
  }

  function setScene(id){
    load();
    data.currentSceneId = id;
    save();
  }

  function addItem(itemId){
    load();
    if (!data.inventory.includes(itemId)) data.inventory.push(itemId);
    save();
  }

  function removeItem(itemId){
    load();
    data.inventory = data.inventory.filter(x => x !== itemId);
    save();
  }

  function hasItem(itemId){
    load();
    return data.inventory.includes(itemId);
  }

  function setFlag(name, value){
    load();
    data.flags[name] = value;
    save();
  }

  function getFlag(name){
    load();
    return data.flags[name];
  }

  return {
    get: load,
    setScene,
    addItem, removeItem, hasItem,
    setFlag, getFlag
  };
})();
