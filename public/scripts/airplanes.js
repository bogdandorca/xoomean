String.prototype.dmFormat = function(){
    if(this.length === 1){
        return '0'+this;
    } else {
        return this;
    }
};
String.prototype.decodeHtmlEntity = function(){
    var ta = document.createElement('textarea');
    ta.innerHTML = this;
    return ta.value;
};