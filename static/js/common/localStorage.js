function setLocalStorage(cname, cvalue = true) {
  const item = { value: cvalue };
  localStorage.setItem(cname, JSON.stringify(item));
}

function getLocalStorage(cname) {
  const itemStr = localStorage.getItem(cname);
  if (!itemStr) return "";
  
  try {
    const item = JSON.parse(itemStr);
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