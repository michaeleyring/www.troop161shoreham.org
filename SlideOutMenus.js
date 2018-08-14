/*****************************************************
* SlideOutMenu
*
* a little script to create exclusive, slide-out
* menus for ns4, ns6, mozilla, opera, ie4, ie5 on 
* mac and win32. I've got no linux or unix to test on but 
* it should(?) work... 
*
*****************************************************/
SlideOutMenu.Registry = []
SlideOutMenu.aniLen = 250
SlideOutMenu.hideDelay = 500
SlideOutMenu.minCPUResolution = 10

// constructor
function SlideOutMenu(id, dir, left, top, width, height) {
 this.ie = document.all ? 1 : 0
 this.ns4 = document.layers ? 1 : 0
 this.dom = document.getElementById ? 1 : 0
 if (this.ie || this.ns4 || this.dom) {
  this.id = id
  this.dir = dir
  this.orientation = dir == "left" || dir == "right" ? "h" : "v"
  this.dirType = dir == "right" || dir == "down" ? "-" : "+"
  this.dim = this.orientation == "h" ? width : height
  this.hideTimer = false
  this.aniTimer = false
  this.open = false
  this.over = false
  this.startTime = 0
  this.gRef = "SlideOutMenu_"+id
  eval(this.gRef+"=this")
  SlideOutMenu.Registry[id] = this
  var d = document
  var strCSS = '<style type="text/css">';
  strCSS += '#' + this.id + 'Container { visibility:hidden; '
  strCSS += 'left:' + left + 'px; '
  strCSS += 'top:' + top + 'px; '
  strCSS += 'overflow:hidden; z-index:10000; }'
  strCSS += '#' + this.id + 'Container, #' + this.id + 'Content { position:absolute; '
  strCSS += 'width:' + width + 'px; '
  strCSS += 'height:' + height + 'px; '
  strCSS += 'clip:rect(0 ' + width + ' ' + height + ' 0); '
  strCSS += '}'
  strCSS += '</style>'
  d.write(strCSS)
  this.load()
 }
}

SlideOutMenu.prototype.load = function() {
 var d = document
 var lyrId1 = this.id + "Container"
 var lyrId2 = this.id + "Content"
 var obj1 = this.dom ? d.getElementById(lyrId1) : this.ie ? d.all[lyrId1] : d.layers[lyrId1]
 if (obj1) var obj2 = this.ns4 ? obj1.layers[lyrId2] : this.ie ? d.all[lyrId2] : d.getElementById(lyrId2)
 var temp
 if (!obj1 || !obj2) window.setTimeout(this.gRef + ".load()", 100)
 else {
  this.container = obj1
  this.menu = obj2
  this.style = this.ns4 ? this.menu : this.menu.style
  this.homePos = eval("0" + this.dirType + this.dim)
  this.outPos = 0
  this.accelConst = (this.outPos - this.homePos) / SlideOutMenu.aniLen / SlideOutMenu.aniLen 
// set event handlers...
  if (this.ns4) this.menu.captureEvents(Event.MOUSEOVER | Event.MOUSEOUT);
  this.menu.onmouseover = new Function("SlideOutMenu.showMenu('" + this.id + "')")
  this.menu.onmouseout = new Function("SlideOutMenu.hideMenu('" + this.id + "')")
//set initial state...
  this.endSlide()
 }
}

SlideOutMenu.showMenu = function(id)
{
 var reg = SlideOutMenu.Registry
 var obj = SlideOutMenu.Registry[id]
 if (obj.container) {
  obj.over = true
  for (menu in reg) if (id != menu) SlideOutMenu.hide(menu)
  if (obj.hideTimer) { reg[id].hideTimer = window.clearTimeout(reg[id].hideTimer) }
  if (!obj.open && !obj.aniTimer) reg[id].startSlide(true)
 }
}

SlideOutMenu.hideMenu = function(id)
{
 var obj = SlideOutMenu.Registry[id]
 if (obj.container) {
  if (obj.hideTimer) window.clearTimeout(obj.hideTimer)
  obj.hideTimer = window.setTimeout("SlideOutMenu.hide('" + id + "')", SlideOutMenu.hideDelay);
 }
}

SlideOutMenu.hideAll = function()
{
 var reg = SlideOutMenu.Registry
 for (menu in reg) {
  SlideOutMenu.hide(menu);
  if (menu.hideTimer) window.clearTimeout(menu.hideTimer);
 }
}

SlideOutMenu.hide = function(id) {
 var obj = SlideOutMenu.Registry[id]
 obj.over = false
 if (obj.hideTimer) window.clearTimeout(obj.hideTimer)
 obj.hideTimer = 0
 if (obj.open && !obj.aniTimer) obj.startSlide(false)
}

SlideOutMenu.prototype.startSlide = function(open) {
 this[open ? "onactivate" : "ondeactivate"]()
 this.open = open
 if (open) this.setVisibility(true)
 this.startTime = (new Date()).getTime() 
 this.aniTimer = window.setInterval(this.gRef + ".slide()", SlideOutMenu.minCPUResolution)
}

SlideOutMenu.prototype.slide = function() {
 var elapsed = (new Date()).getTime() - this.startTime
 if (elapsed > SlideOutMenu.aniLen) this.endSlide()
 else {
  var d = Math.round(Math.pow(SlideOutMenu.aniLen-elapsed, 2) * this.accelConst)
  if (this.open && this.dirType == "-") d = -d
  else if (this.open && this.dirType == "+") d = -d
   else if (!this.open && this.dirType == "-") d = -this.dim + d
    else d = this.dim + d
  this.moveTo(d)
 }
}

SlideOutMenu.prototype.endSlide = function() {
 this.aniTimer = window.clearTimeout(this.aniTimer)
 this.moveTo(this.open ? this.outPos : this.homePos)
 if (!this.open) this.setVisibility(false)
 if ((this.open && !this.over) || (!this.open && this.over)) {
  this.startSlide(this.over)
 }
}

SlideOutMenu.prototype.setVisibility = function(bShow) { 
 var s = this.ns4 ? this.container : this.container.style
 s.visibility = bShow ? "visible" : "hidden"
}

SlideOutMenu.prototype.moveTo = function(p) { 
 this.style[this.orientation == "h" ? "left" : "top"] = this.ns4 ? p : p + "px"
}

SlideOutMenu.prototype.getPos = function(c) {
 return parseInt(this.style[c])
}

SlideOutMenu.prototype.onactivate = function() { }
SlideOutMenu.prototype.ondeactivate = function() { }
