import Vue          from 'vue'
import * as Vuex    from 'vuex'
import Storage      from 'vue-local-storage'
import Axios        from 'axios'
import Env          from '../env'
import Util         from '../util'
import RoleService  from '../services/RoleService'
import JsonDataAuth from '../api/file_data_auth.json'

Vue.use(Vuex)

export default new Vuex.Store({
  actions: {
    doLogin ({commit}, {self}) {
      Axios.post(Env.API + '/login', self.params).then((r) => {
        if (r.status === 200) {
          self.dataNotify = {}
          Util.setCookie('co-stg-a-u-au', r.data, 1)
          this.dispatch('validateIfExist', {self: self})
        }
      }).catch((e) => {
        self.dataNotify = e.response
        self.dataNotify.classAlert = 'alert alert-dark alert-dismissible fade show mb-0 border-0 '
        self.dataNotify.style = 'border-radius:0'
        self.params.username = ''
        self.params.password = ''
        self.$refs.inputUsername.focus()
      }).finally(() => {
        self.loading = false
      })
    },
    doLoginAD ({commit}, {self}) {
      Axios.post(Env.API_NODEJS + '/api/exam/authenticate', self.params).then((r) => {
        if (r.status === 200) {
          const new_data_auth = {
            email: null,
            id: null,
            name: r.data.name_complet,
            project: {id: null, name: null, status: null},
            role: {id: null, name: null, status: null},
            status: null,
            phone: r.data.phone_number,
            username: r.data.username,
          }
          self.dataNotify = {}
          Storage.set('s-u-$4p14', new_data_auth)
          Util.setCookie('co-stg-a-u-au', new_data_auth, 1)
          this.dispatch('validateIfExist', {self: {self, new_data_auth: new_data_auth}})
        }
      }).catch((e) => {
        self.dataNotify = e.response
        self.dataNotify.classAlert = 'alert alert-dark alert-dismissible fade show mb-0 border-0 '
        self.dataNotify.style = 'border-radius:0'
        self.params.username = ''
        self.params.password = ''
        self.$refs.inputUsername.focus()
      }).finally(() => {
        self.loading = false
      })
    },
    validateIfExist ({commit}, {self}) {

      // this.dispatch('getConfig', {self: {}})
      RoleService.dispatch('allRole', {self: {}})

      Axios.post(Env.API + '/if-exist-user', self.new_data_auth).then((r) => {
        switch (r.status) {
          case 201:
            Util.setCookie('co-stg-a-u-au', r.data, 1)
            Storage.set('s-u-$4p14', Util.getCookie('co-stg-a-u-au'))
            self.self.$router.push('/project')
            break
          default://200
            Util.setCookie('co-stg-a-u-au', r.data, 1)
            if (Util.getCookie('co-stg-a-u-au').project.id === 1) {
              self.self.$router.replace('/project')
            } else {
              //crear storage s-u-$4p14
              Storage.set('s-u-$4p14', Util.getCookie('co-stg-a-u-au'))
              //crear cookie de configuracion de toda la app
              Util.setCookie('co-f-stg-a-u-au', Util.getCookie('co-stg-a-u-au'), 1)
              //crear objeto en el archivo file_s-u-$4p14.json
              // Object.assign(JsonDataAuth.json, Storage.get('s-u-$4p14'))
              self.self.$router.replace('/themes')
            }
            break
        }
      }).catch((e) => {
        console.error(e)
      })
    },
    doLogout ({commit}, {self}) {
      // JsonDataAuth.json = {}
      // JsonDataAuth.global_username = ''
      Storage.remove('s-u-$4p14')
      self.$router.replace('/login')
    },
    getConfig ({commit}, {self}) {
      // Storage.set('s-u-$4p14',Util.getCookie('co-stg-a-u-au'))
      // if(Util.getCookie('cookie_settings_app').username === Storage.get('s-u-$4p14').username){
      Axios.post(Env.API + '/usr-cfg-app', {username:  Util.getCookie('co-f-stg-a-u-au').username}).then((r) => {
        // Storage.remove('s-u-$4p14')
        if (r.status === 200) {
          // Storage.set('s-u-$4p14', r.data)
          Object.assign(JsonDataAuth.json, r.data)
          // console.log(JsonDataAuth.json)
        }
      })
      // }else{
      //   window.location.replace('/login')
      // }
    }
  },
})