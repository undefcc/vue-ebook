import CreateAPI from 'vue-create-api'
import Vue from 'vue'
import Toast from '../components/common/Toast'
import Popup from '../components/common/Popup'
import GroupDialog from '../components/shelf/ShelfGroupDialog'

Vue.use(CreateAPI)
Vue.createAPI(Toast, true)// 注意：该方法调用组件根据name调用，所以组件必须有name属性，否则报错
Vue.createAPI(Popup, true)
Vue.createAPI(GroupDialog, true)

Vue.mixin({ // 将调用方法继续封装到全局mixin
    methods: {
        toast (settings) {
            return this.$createToast({
                $props: settings
            })
        },
        popup (settings) {
            return this.$createPopup({
                $props: settings
            })
        },
        simpleToast (text) {
            const toast = this.toast({
                text: text
            })
            toast.show()
            toast.updateText(text)
        },
        dialog (settings) {
            return this.$createGroupDialog({
                $props: settings
            })
        }
    }
})
// this.$createToast({ // 引用createAPI所扩展出来的属性
//     $props: { // 传入Toast组件所需参数
//         text: 'hello toast!'
//     }
// }).show()// DOM显示
