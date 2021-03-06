import Vue          from 'vue'
import * as Vuex    from 'vuex'
import Storage      from 'vue-local-storage'
import Axios        from 'axios'
import Env          from '../env'
import Util         from '../util'
import JsonDataAuth from '../api/file_data_auth.json'

Vue.use(Vuex)

export default new Vuex.Store({
  actions: {
    /*doLoginAD ({commit}, {self}) {
      Axios.post(Env.API_LARAVEL + '/login', self.params).then((r) => {
        if (r.status === 200) {
          self.dataNotify = {}
          Storage.set('s-u-$4p14', r.data)
          Util.setCookie('co-stg-a-u-au', r.data, 1)
          this.dispatch('validateIfExist',
            {self: {self, new_data_auth: r.data}})
          self.loading = false
        }
      }).catch((e) => {
        self.dataNotify = e.response
        self.dataNotify.classAlert = 'alert alert-dark alert-dismissible fade show mb-0 border-0 '
        self.dataNotify.style = 'border-radius:0'
        self.params.username = ''
        self.params.password = ''
        self.$refs.inputUsername.focus()
        self.loading = false
      })
    },*/
    generateToken(){
      Axios.get(Env.API_NODEJS + '/authtoken/generate').then((r) => {
        Storage.set('data_token',r.data.token)
      }).catch((e)=>{
        console.error(e)
      })
    },
    doLoginAD ({commit}, {self}) {
      Axios.post(Env.API_NODEJS + '/api/ldap-service/authenticate', self.params, {headers:{'x-access-token':Storage.get('data_token')}}).then((r) => {
        if (r.status === 200) {
          const new_data_auth = {
            name: r.data.name_complet,
            username: r.data.username,
            id: null,
            email: null,
            project: {id: null, name: null, status: null},
            role: {id: null, name: null, status: null},
            status: null,
          }
          self.dataNotify = {}
          Storage.set('s-u-$4p14', new_data_auth)
          Util.setCookie('co-stg-a-u-au', new_data_auth, 1)
          this.dispatch('validateIfExist', {self: {self, new_data_auth: new_data_auth}})
        }
      }).catch((e) => {
        if (e.response != undefined) {
          console.log(e.response)
          if(e.response.status === 404){
            if(e.response.data.message != undefined){
              e.response.data = '<span>El Token se ha vencido, para refrescar haga click en el boton con el icono <b><i class="fa fa-refresh"></i></b></span>'
            }
          }
          self.dataNotify = e.response
          self.dataNotify.classAlert = 'alert alert-danger alert-dismissible fade show mb-0 border-0 '
          self.dataNotify.style = 'border-radius:0'
          self.params.password = ''
          self.$refs.inputPassword.focus()
          self.loading.btn = false
        } else {
          console.error(e)
          self.modal.show = true
          if (e.response.status == 401) {
            self.dataError = e.response.data
          } else if(e.response.status == 404){
            self.dataError = '<span>Estimado <b>Usuario</b>, el token se ha vencido, haga click en el boton con el icono <i class="fa fa-refresh"></i>.</span>'
          } else {
            self.dataError = '<span>Estimado <b>Usuario</b>, estamos presentando problemas en nuestros servicios; por favor vuelva intentarlo de nuevo o mas tarde.</span>'
          }
          Util.openModal(document, self.modalId)
        }
      })
    },
    validateIfExist ({commit}, {self}) {
      Axios.post(Env.API_LARAVEL + '/if-exist-user', self.new_data_auth).
      then((r) => {
        switch (r.status) {
          case 201:
            Util.setCookie('co-stg-a-u-au', r.data, 1)
            Storage.set('s-u-$4p14', Util.getCookie('co-stg-a-u-au'))
            self.self.$router.push('/project')
            self.self.loading.btn = false
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
              self.self.$router.replace('/themes')
              self.self.loading.btn = false
            }
            break
        }
      }).
      catch((e) => {
        console.error(e)
        self.self.modal.show = true
        if (e.response.status == 401) {
          self.self.dataError = e.response.data
        } else {
          self.self.dataError = '<span>Estimado <b>Usuario</b>, estamos presentando problemas en nuestros servicios; porfavor vuelva intentarlo de nuevo o mas tarde.</span>'
        }
        Util.openModal(document, self.self.modalId)
      })
    },
    doLogout ({commit}, {self}) {
      JsonDataAuth.json = {}
      Storage.remove('s-u-$4p14')
      self.$router.replace('/login')
    },
    getConfig ({commit}, {self}) {
      Axios.post(Env.API_LARAVEL + '/u-object-rest-apis-application', {username: Util.getCookie('co-f-stg-a-u-au').username}).then((r) => {
        if (r.status === 200) {
          Object.assign(JsonDataAuth.json, r.data)
        }
      }).catch((e) => {
        console.error(e)
      })
    },
    getUsers ({commit}, {self}) {
      Axios.get(Env.API_LARAVEL + '/get-users').then((r) => {
        if (r.status === 200) {
          self.dataUsers = r.data
        }
      }).catch((e) => {
        console.error(e)
      })
    },
    allUser ({commit}, {self}) {
      Axios.get(Env.API_LARAVEL + '/all-user', {params: self.params}).
      then((r) => {
        if (r.status === 200) {
          self.loadingTable = false
          self.dataUsers = r.data
        }
      }).
      catch((e) => {
        console.error(e)
      })
    },
  },
})