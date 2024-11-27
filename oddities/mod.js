let logger = null
let store = null

// const css_smallmainmenu = `
// .homepage.pageBody {
//    .card {
//         margin-top: 1em;
//         img.logo {
//             display: none;
//         }
//         .rowItem {
//             flex: 1 0 30%;
//             .description p:last-child {
//                 display: none;
//             }
//         }
//    }
//     .mspaCard .mainSection {
//         display: flex;
//         flex-flow: row;
//         justify-content: space-around;
//         width: 100%;
//         padding-bottom: 1em;
//         .description {
//             display: none;
//         }
//         .jbCard, .bqCard, .psCard {
//             padding-top: 0 !important;
//             flex: 1 1 0;
//             div.icon {
//                 margin: auto;
//                 font-size: 28px;
//                 img {
//                     margin: auto;
//                 }
//             }
//        }
//     }
//    .card.logoCard, div.logo {
//        display: none;
//    }
//     .jbCard .icon a::after { content: "Jailbreak"; }
//     .bqCard .icon a::after { content: "Bard Quest"; }
//     .psCard .icon a::after { content: "Problem Sleuth"; }
// }`

const css_smalllog = `
.textContent .log .logContent {
    max-height: 14em;
    overflow: auto;
}`

function replaceContent(story, key, pat, repl){
    story[key].content = story[key].content.replace(pat, repl)
}

const browserActions = {
    DevModeToggle: {
      component: {
        methods: {
          toggle(){
            this.$localData.settings.devMode = !this.$localData.settings.devMode
          }
        },
        render: function(){ // with (this) {
          return this._c(
            "div",
            { staticClass: "systemButton",
              class: { active: this.$localData.settings.devMode },
              on: { click: this.toggle }
            },
            [ this._c("fa-icon", {
                attrs: { icon: "mouse-pointer" }
              })
            ], 1
          )
        } // }
      }
    },
    HQAudioToggle: {
      component: {
        methods: {
          toggle(){
            const { ipcRenderer } = require('electron')
            this.$localData.settings.hqAudio = !this.$localData.settings.hqAudio
            this.$localData.root.saveLocalStorage()
            this.$localData.root.applySaveIfPending()
            ipcRenderer.send('RELOAD_ARCHIVE_DATA')
          }
        },
        render: function(){ // with (this) {
          return this._c(
            "div",
            { staticClass: "systemButton",
              class: { active: this.$localData.settings.hqAudio },
              on: { click: this.toggle }
            },
            [ this._c("fa-icon", {
                attrs: { icon: "music" }
              }),
              this._c("span", { staticClass: "badge" },
                [this._v(this.$localData.settings.hqAudio ? "HQ" : "LQ")]
              )
            ], 1
          )
        } // }
      }
    },
    VizNumberToggle: {
      component: {
        methods: {
          toggle(){
            this.$localData.settings.mspaMode = !this.$localData.settings.mspaMode
          }
        },
        render: function(){ // with (this) {
          return this._c(
            "div",
            { staticClass: "systemButton",
              class: { active: this.$localData.settings.mspaMode },
              on: { click: this.toggle }
            },
            [ this._c("fa-icon", {
                attrs: { icon: "external-link-alt" }
              }),
              this._c("span", { staticClass: "badge" },
                [this._v(this.$localData.settings.mspaMode ? "MSPA" : "Viz")]
              )
            ], 1
          )
        } // }
      }
    }
}

module.exports = {
    title: "UHC Oddities", 
    summary: "Features and tweaks that are too weird for settings",
    author: "GiovanH",
    modVersion: 0.3,

    routes: {},
    styles: [],

    computed(api) { 
        logger = api.logger
        store = api.store

        computed = {
            routes: [],
            styles: []
        }
        computed.routes['assets://pseudo/v1_compressed.png'] = './collection_logo.png'
        
        if (store.get("extraButtons")) {
            computed.browserActions = browserActions
        }
        
        if (store.get("notricksterbanner")) {
            computed.styles.push(
                {body: "div.pageBody.trickster nav.navBanner {display: none;}"}
            )
        }
        logger.log(store.get("logo_src"))
        if (store.get("logo_src")?.width) {
            computed.styles.push(
                {body: `
.pageBody {
    .topLogo {
        img, video {
            width: ${store.get("logo_src")?.width}px !important;
        }
    }
}`})
        }
        // if (store.get("smallmainmenu")) {
        //     computed.styles.push(
        //         {body: css_smallmainmenu}
        //     )
        // }
        if (store.get("smalllog")) {
            computed.styles.push(
                {body: css_smalllog}
            )
        }
        return computed
    },

    edit(archive) {
        if (store.get("calliope")) {
            archive.mspa.story['006997'].content = `<p style=" font-weight: bold; font-family: courier, monospace;color:#000000">
            [Author's note:<br><br>Let's avoid posting spoiler images all over tumblr, just this once?<br>
            <br>If you absolutely MUST proliferate an image, <a href="/storyfiles/hs2/scraps/calliope.gif" target="_blank" class="postlink">please post this instead</a>.]
            </p>`
        }
        if (store.get("no2009")) {
            replaceContent(archive.mspa.story, '001901', "April, 2009,", "April,")
        }
        if (store.get("whiterapper")) {
            replaceContent(archive.mspa.story, '002286', "being a white guy who is a rapper", "being a Íæûë€Å guy who is a rapper")
        }

        if (store.get("clearThemesForNewReader"))
            archive.tweaks.clearThemesForNewReader = true

        if (store.get("swfnav_keyboardenable"))
            archive.tweaks.forceKeyboardEnable = true
    },

    vueHooks: [{
        // same as match(c) {return c.$options.name == "pageText"}
        matchName: "log",
        data: {
            adventureLinks($super) {
                // Todo: properly insert links into arbitrary super
                if (store.get("ryanlogs")) {
                    return [
                        {href: "/log/1", img: "/images/archive_jb.gif", label: "Jailbreak"},
                        {href: "/log/2", img: "/images/archive_bq.gif", label: "Bard Quest"},
                        {href: "/log/4", img: "/images/archive_ps.gif", label: "Problem Sleuth"},
                        {href: "/log/5", img: "/images/archive_beta.gif", label: "Homestuck Beta"},
                        {href: "/log/6", img: "/images/archive_hs.gif", label: "Homestuck"},
                        {href: "/log/ryanquest", img: "/images/archive_rq.png", label: "Ryanquest"}
                    ]
                } else return $super
            }
        }
    },{
        matchName: "logo",
        computed: {
            logo_src($super){
                return store.get("logo_src")?.src || $super
            }
        }
    // },{
    //     matchName: "epilogues",
    //     data: {
    //         fakechat($super){
    //             return store.get("epiloguesfakechat", $super)
    //         }
    //     }
    },{
        match: (c)=> ["addressBar", "jumpBox"].includes(c.$options.name),
        computed: {
            allUrlSuggestions($super){
                if (store.get("nosuggest"))
                    return []
                else
                    return $super
            }
        }
    },{
        match: (c)=> ["page", "x2Combo"].includes(c.$options.name),
        computed: {
            showMetadata($super){
                if (store.get("readmeta"))
                    return true
                else
                    return $super
            }
        }
    },{
        matchName: "navBanner",
        data: {
            urls($super){
                if (store.get('altnavbanner')) {
                    return [
                        [
                          "https://www.homestuck.com"
                        ],
                        [
                          "/",
                          "toggleJumpBox"
                        ],
                        [
                          "/map",
                          "/log",
                          "/search"
                        ],
                        [
                          "toggleBookmarks"
                        ],
                        [
                          "/settings",
                          "/credits"
                        ]
                    ]
                } else return $super
            },
            labels($super){
                let labels = $super
                if (store.get('altnavbanner')) {
                    labels['mspa']["https://www.homestuck.com"] = "VIZ"
                    labels['mspa']["/"] = "HOMESTUCK"
                    // labels['mspa']["/log"] = this.labels['']["/log"]
                }
                return labels
            }
        },
    }],

    settings: {
        radio: [{
            model: "logo_src",
            label: "Logo style",
            desc: "Change the style of the main collection logo on the Homepage.",
            options: [{
                value: { src: "assets://archive/collection/logo_v2_full.webm" },
                label: "New Logo (Default)",
            },{
                value: { src: "assets://archive/collection/logo_v2_static.png" },
                label: "New Logo (Static)",
            },{
                value: { src: "assets://archive/collection/logo_v2_reduced.webm" },
                label: "New Logo (Reduced motion)",
            },{
                value: { src: "assets://archive/collection/logo_v2_slower.mp4" },
                label: "New Logo (Slower)",
            },{
                value: { 
                    src: "assets://archive/collection/logo_v1.png",
                    width: 700
                },
                label: "Old logo"
            },{
                value: { 
                    src: "assets://pseudo/v1_compressed.png",
                    width: 700
                },
                label: "Compressed logo"
            }]
        }],
        boolean: [{
            model: "altnavbanner",
            label: "Alternate nav banner", 
            desc: "Use the old nav banner from v1.1.0",
        },{
        //     model: "smallmainmenu",
        //     label: "Smaller main menu layout"
        // },{
            model: "extraButtons",
            label: "Extra buttons",
            desc: "Additional debugging buttons in the address bar"
        },{
            model: "smalllog",
            label: "Small dialogue box",
            desc: "Clamp the size of the dialogue area, so the panel stays in view."
        },{
            model: "nosuggest",
            label: "Disable address bar suggestions"
        },{
            model: "swfnav_keyboardenable",
            label: "Always enable keyboard shortcuts",
            desc: 'If "Enable arrow key navigation" is enabled, this forces arrow keys to work even on pages without clickable links. Enabling this may allow you to accidentally skip content.'
        },{
            model: "ryanlogs",
            label: "Show Extra Logs",
            desc: "Include buttons for side adventures under <code>/logs</code>"
        },{
            model: "calliope",
            label: "Show Author Note",
            desc: "Show author note on <a href='/mspa/006997'>p=006997</a>"
        },{
            model: "no2009",
            label: "No 2009",
            desc: "Reverses the date retcon on the first page of Homestuck"
        },{
            model: "notricksterbanner",
            label: "Allow hiding banner",
            desc: "Allows the app to hide the main navigation banner on normal pages where the story did."
        },{
            model: "readmeta",
            label: "Show readmspa metadata box"
        },{
            model: "whiterapper",
            label: "Íæûë€Å",
            desc: "See <a href='/tumblr/iaeu-eeura'>/tumblr/iaeu-eeura</a>"
        },{
            model: "clearThemesForNewReader",
            label: "Reset theme settings when new reader mode is enabled",
        // },{
        //     model: "epiloguesfakechat",
        //     label: "Epilogues: wrap chat in fake log boxes",
        }]
    }
}
