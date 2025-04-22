function setLocalStorage(cname, cvalue = true, exdays = 30) {
  const now = new Date();
  const expireTime = now.getTime() + (exdays * 24 * 60 * 60 * 1000);
  const item = {
    value: cvalue,
    expiry: expireTime
  };
  localStorage.setItem(cname, JSON.stringify(item));
}

function getLocalStorage(cname) {
  const itemStr = localStorage.getItem(cname);
  if (!itemStr) return "";
  
  try {
    const item = JSON.parse(itemStr);
    const now = new Date();
    if (now.getTime() > item.expiry) {
      localStorage.removeItem(cname);
      return "";
    }
    return item.value;
  } catch {
    return "";
  }
}

function getAllLocalStorage(arr = []) {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const itemStr = localStorage.getItem(key);
    try {
      const item = JSON.parse(itemStr);
      arr.push([key, item.value]);
    } catch {
      arr.push([key, itemStr]);
    }
  }
  return arr;
}

function checkLocalStorage(cname) {
  return getLocalStorage(cname) !== "";
}

function getLocalStorageUsage() {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    total += key.length + value.length;
  }

  const bytes = total * 2;
  const kilobytes = bytes / 1024;
  return kilobytes.toFixed(2)+' Kb';
}

function deleteLocalStorage(cname) {
  localStorage.removeItem(cname);
}