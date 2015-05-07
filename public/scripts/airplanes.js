String.prototype.dmFormat = function(){
    if(this.length === 1){
        return '0'+this;
    } else {
        return this;
    }
};