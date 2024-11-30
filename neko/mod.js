let logger = null
let store = null
let imgs = []
const fs = require('fs')
const path = require('path')
let options = []
fs.readdir(path.join(__dirname, "imgs"), (err, files) => {
  files.forEach(file => {
    let assetPath = "assets://mod/neko/imgs/" + file
    imgs.push(assetPath)
    options.push({value: assetPath, label: path.parse(file).name})
  })
})
module.exports = {
  title: "Neko",
  summary: "gives you a little friend",
  author: "GiovanH",
  modVersion: 0.3,

  trees: {
    "./": "assets://mod/neko/"
  },
  
  settings: {
    boolean: [{
      model: "random-image",
      label: "Randomize Image"
    }, {
      model: "fixedpos",
      label: "Fixed position",
      desc: "Attach to your screen, not the page."
    }],
    radio: [{
      model: "image",
      label: "Image"
    }],
  },

  computed(api) {
    logger = api.logger	
	store = api.store
    store.set("random-image", store.get("random-image", true))
	store.set("image", store.get("image", imgs[0]))
  },

  vueHooks: [{
    matchName: "TabFrame",
    created() {
      this.nekoMod_hasNeko = false
    },
    updated() {
      this.$nextTick(() => {
	var img = store.get("random-image", true) 
	  ? imgs[Math.floor(Math.random() * imgs.length)] 
	  : store.get("image", imgs[0])
        if (!this.nekoMod_hasNeko) {
	      var x = document.createElement("IMG")
	      x.setAttribute("src", img)
	      x.setAttribute("id", "floating-buddy")
	      if (this.$el.nodeType === 8) return
	      this.$el.appendChild(x)
	    
            x.style.width = "100px"

          x.style.position = store.get("fixedpos") ? "fixed" : "absolute"
          x.style.zIndex = "3"

          x.style.top = store.get(`${this.tabKey}_top`, "550px")
          x.style.left = store.get(`${this.tabKey}_left`, "850px")

          x.style.cursor = "grab"
          x.style.transform = "translate(-50%, -50%)" // center on cursor

          x.addEventListener("dragstart", (event) => {
            const rect = x.getBoundingClientRect();
            // x.style.transform = `translate(-${event.clientX - rect.left}px, -${event.clientY - rect.top}px)`
          })
          x.addEventListener("dragend", (event) => {
            const top = event.clientY + 'px'
            const left = event.clientX + 'px'
            store.set(`${this.tabKey}_top`, top)
            store.set(`${this.tabKey}_left`, left)
            x.style.top = top
            x.style.left = left
          })
          this.nekoMod_hasNeko = true
          return
        }
	let buddy = document.getElementById("floating-buddy")
	buddy.setAttribute("src", img);
      })
    },
    destroyed(){
      store.delete(`${this.tabKey}_top`)
      store.delete(`${this.tabKey}_left`)
    }
  }]
}
module.exports.settings.radio[0].options = options
