<template>
    <div class="card mt-0 mb-0">
        <div class="card-header">
            <div class="row">
                <div class="col-6 mt-auto mb-auto">
                    <span class="card-title">
                        <span>Solucion del Examen</span>
                    </span>
                </div>
                <div class="col-6 text-right">
                    <template v-if="before_path != ''">
                        <router-link class="btn btn-link text-secondary" :to="{path:before_path}">
                            <i class="fa fa-angle-left fa-fw"></i>
                            <span>Volver</span>
                        </router-link>
                    </template>
                    <template v-else>
                        <router-link class="btn btn-link text-secondary" :to="{name:'themes'}">
                            <i class="fa fa-angle-left fa-fw"></i>
                            <span>Volver</span>
                        </router-link>
                    </template>
                </div>
            </div>
            <hr>
            <div class="row">
                <div class="col-2 mt-3 mb-3">
                    <div class="input-group input-group">
                        <div class="input-group-prepend">
                            <span class="input-group-text">Nota</span>
                        </div>
                        <span class="form-control">{{dataExamSolution.score}}</span>
                    </div>
                </div>
                <div class="col-10 mt-3 mb-3">
                    <div class="row">
                        <div class="col-4">
                            <div class="input-group input-group">
                                <div class="input-group-prepend">
                                    <span class="input-group-text">Rpta Correcta</span>
                                </div>
                                <span class="form-control text-center"><i class="fa fa-check text-success"></i></span>
                            </div>
                        </div>
                        <div class="col-4">
                            <div class="input-group input-group">
                                <div class="input-group-prepend">
                                    <span class="input-group-text">Rpta Incorrecta</span>
                                </div>
                                <span class="form-control text-center"><i class="fa fa-close text-danger"></i></span>
                            </div>
                        </div>
                        <div class="col-4">
                            <div class="input-group input-group">
                                <div class="input-group-prepend">
                                    <span class="input-group-text">Rpta vacia</span>
                                </div>
                                <span class="form-control text-center"><i class="fa fa-exclamation-triangle text-warning"></i></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="card-body">
            <div v-if="loadingTable" class="text-center">
                <table class="table">
                    <tr>
                        <td class="text-dark text-center">
                            <div style="padding: 3em 2em 0 2em">
                                <i class="fa fa-circle-o-notch fa-spin fa-2x mb-2"></i>
                                <p>Obteniendo Informacion!</p>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
            <div v-if="!loadingTable && dataExamSolution.dataExam.length" v-for="(v,k) in dataExamSolution.dataExam">
                <table class="table table-vue">
                    <thead>
                    <tr class="bg-light">
                        <th class="pb-0">
                            <!-- Pregunta -->
                            <table class="w-100">
                                <tr>
                                    <td width="2%" style="border-top: none">
                                        <span>{{k+1}}.-</span>
                                    </td>
                                    <td width="96%" style="border-top: none">
                                        <span v-html="v.question_name"></span>
                                    </td>
                                    <td width="2%" class="mx-auto" style="border-top: none">
                                        <template v-if="v.user_option_answer_id == null">
                                            <i class="fa fa-exclamation-triangle text-warning" title="Esta es la pregunta vacia" style="cursor: pointer"></i>
                                        </template>
                                    </td>
                                </tr>
                            </table>
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(vv,kk) in dataExamSolution.dataExam[k].options_answers">
                        <td class="pt-0 pb-0">
                            <!-- Opciones de Respuesta -->
                            <table class="w-100">
                                <tr>
                                    <td width="2%" style="border-top: none">
                                        <b>{{util.returnLetter(kk)}})&nbsp;</b>
                                    </td>
                                    <td width="96%" class="my-auto" style="border-top: none">{{vv.name}}</td>
                                    <td width="2%" class="mx-auto" style="border-top: none">
                                        <template v-if="vv.id == v.option_answer_id && vv.id == v.user_option_answer_id">
                                            <i class="fa fa-check text-success" title="Esta es la rpta que marcaste y la rpta correcta" style="cursor: pointer"></i>
                                        </template>
                                        <template v-else>
                                            <i v-if="vv.id == v.option_answer_id" class="fa fa-check text-success" title="Esta es la rpta correcta" style="cursor: pointer"></i>
                                            <i v-if="vv.id == v.user_option_answer_id" class="fa fa-close text-danger" title="Esta es la rpta que marcaste" style="cursor: pointer"></i>
                                        </template>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    </tbody>
                </table>
                <br>
            </div>
            <div v-if="!loadingTable && dataExamSolution.dataExam.length < 1" class="text-center">
                <table class="table">
                    <tr>
                        <td class="text-dark text-center">
                            <div style="padding: 3em 2em 0 2em">
                                <i class="fa fa-exclamation-triangle fa-2x mb-2"></i>
                                <p>Información no disponible!</p>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
  import Util        from '../../util'
  import Storage     from 'vue-local-storage'
  import ExamService from '../../services/ExamService'
  import Role from '../../role'

  export default {
    name: 'ExamSolution',
    data: () => ({
      util: Util,
      storage: Storage,
      loadingTable: true,
      loadComponentExamSolution: false,
      dataExamSolution: {},
      params: {
        user_survey_theme_id: null,
      },
      before_path:''
    }),
    created () {
      this.load()
    },
    methods: {
      load () {
        // Si son usuarios administradores pueden agregar cualquier cosa en la url en el parametro de hash
        if(Util.validateRole([Role.SUPER,Role.ADMINISTRADOR])){
          this.loadingTable = true
          if(this.$route.params.before_path != undefined){
            this.before_path = this.$route.params.before_path;
          }
          this.params.user_survey_theme_id = this.$route.params.user_survey_theme_id
          ExamService.dispatch('loadExamSolution', {self: this})
        } else {
          // Si son otros usuarios es necesario crear el hash, por seguridad al sabotaje
          if(Storage.get('$h4sh') != null){
            if(this.$route.params.hash == Storage.get('$h4sh').hash){
                this.loadingTable = true
                if(this.$route.params.before_path != undefined){
                  this.before_path = this.$route.params.before_path;
                }
                this.params.user_survey_theme_id = this.$route.params.user_survey_theme_id
                ExamService.dispatch('loadExamSolution', {self: this})
            }else{
              this.$router.replace({path:'/know'})
            }
          }else{
            this.$router.replace({path:'/know'})
          }
        }
      }
    }
  }
</script>

<style scoped>

</style>