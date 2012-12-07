function HashMap(){
  var size = 0;
  var entry = new Object();

  this.put = function(key, value){
    if(!this.containsKey(key)){
      size++;
    }
    entry[key] = value;
  }

  this.get = function(key){
    if(this.containsKey(key)){
      return entry[key];
    }
    else{
      return null;
    }
  }

  this.remove = function(key){
    if(delete entry[key]){
      size--;
    }
  }

  this.containsKey = function(key){
    return (key in entry);
  }

//need to customed
  this.containsValue = function(value){
    for(var prop in entry){
      if(entry[prop] === value){
        return true;
      }
    }
    return false;
  }

  this.values = function(){
    var values = new Array(size);
    for(var prop in entry){
      values.push(entry[prop]);
    }
    return values;
  }

  this.keys = function(){
    var keys = new Array[size];
    for(var prop in entry){
      keys.push(prop);
    }
    return keys;
  }

  this.size = function(){
    return size;
  }
}

String.prototype.Trim = function() 
{ 
return this.replace(/(^\s*)|(\s*$)/g, ""); 
} 
 
String.prototype.LTrim = function() 
{ 
return this.replace(/(^\s*)/g, ""); 
} 
 
String.prototype.RTrim = function() 
{ 
return this.replace(/(\s*$)/g, ""); 
} 

