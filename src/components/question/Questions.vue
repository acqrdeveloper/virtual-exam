<template>
    <div class="card">
            <div class="card-header bg-light text-dark">
                <div class="row">
                    <div class="col-6 mt-auto mb-auto">
                        <span class="card-title">Lista de Preguntas</span>
                    </div>
                    <div class="col-6 text-right">
                        <div v-show="util.validateRole([role.SUPER,role.ADMINISTRADOR,role.ESCRITOR])">
                            <router-link :to="{name:'create-question'}" class="btn btn-outline-secondary">
                                <i class="fa fa-plus fa-fw"></i><span>Crear Nuevo</span>
                            </router-link>
                        </div>
                    </div>
                </div>
                <hr>
                <div class="form-inline">
                    <div class="input-group">
                        <div class="input-group-prepend">
                            <span class="input-group-text"><i class="fa fa-filter"></i></span>
                        </div>
                        <select title="" class="form-control" v-model="params.theme_id" @change="change()">
                            <option value="" selected>Seleccionar Tema</option>
                            <option v-for="(v) in dataTheme" :value="v.id">{{v.name}}</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <div class="input-group-prepend">
                            <span class="input-group-text"><i class="fa fa-filter"></i></span>
                        </div>
                        <select title="" class="form-control" v-model="params.status" @change="change()">
                            <option value="" selected>Seleccionar Estado</option>
                            <option value="A">Activo</option>
                            <option value="I">Inactivo</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <div class="input-group-prepend">
                            <span class="input-group-text"><i class="fa fa-filter"></i></span>
                        </div>
                        <select title="" class="form-control" v-model="params.level" @change="change()">
                            <option value="" selected>Seleccionar Nivel</option>
                            <option value="F">Facil</option>
                            <option value="R">Regular</option>
                            <option value="D">Dificil</option>
                        </select>
                    </div>
                    <button title="actualizar datos" class="btn btn-outline-secondary" @click="change()"><i class="fa fa-refresh"></i></button>
                </div>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-sm table-hover">
                        <thead>
                        <tr>
                            <th><b>#</b></th>
                            <th width="55%">Pregunta</th>
                            <th class="pl-3">Actualizado</th>
                            <th>Nivel</th>
                            <th width="5%" class="text-center">Estado</th>
                            <th width="10%" class="text-right">Acción</th>
                        </tr>
                        </thead>
                        <tbody v-if="loadingTable">
                        <tr>
                            <td colspan="6" class="text-dark text-center">
                                <div style="padding: 3em 2em 0 2em">
                                    <i class="fa fa-circle-o-notch fa-spin fa-2x mb-2"></i>
                                    <p>Obteniendo Informacion!</p>
                                </div>
                            </td>
                        </tr>
                        </tbody>
                        <tbody v-if="!loadingTable && dataQuestion.length">
                        <tr v-for="(v,k) in dataQuestion">
                            <th>{{k+1}}</th>
                            <td v-html="v.name"></td>
                            <td class="pl-3">{{v.updated_at}}</td>
                            <td>{{dataLevels(v.level)}}</td>
                            <td class="text-center">
                                <i v-if="v.status === 'A' " class="fa fa-circle text-success"></i>
                                <i v-else="" class="fa fa-circle text-danger"></i>
                            </td>
                            <td class="text-right">
                                <div class="btn-group dropdown btn-group-sm" role="group">
                                    <router-link class="btn btn-warning btn-sm" :to="{name:'edit-question',params:{dataQuestion:v}}">
                                        <i class="fa fa-edit fa-fw"></i>
                                    </router-link>
                                    <div class="btn-group open" role="group">
                                        <button type="button" class="btn btn-light btn-sm dropdown-toggle" data-toggle="dropdown" aria-expanded="true">
                                            <span class="caret"></span>
                                        </button>
                                        <ul class="dropdown-menu dropdown-menu-right" aria-labelledby="alertsDropdown">
                                            <li title="Exportar">
                                                <a href class="dropdown-item text-muted">
                                                    <small>Change Status</small>
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        </tbody>
                        <tbody v-else-if="!loadingTable && dataQuestion.length < 1">
                        <tr>
                            <td colspan="6" class="text-dark text-center">
                                <div style="padding: 3em 2em 0 2em">
                                    <i class="fa fa-exclamation-triangle fa-2x mb-2"></i>
                                    <p>No hay información disponible!</p>
                                </div>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
</template>

<script>
  import ThemeService    from '../../services/ThemeService'
  import QuestionService from '../../services/QuestionService'
  import Util             from '../../util'
  import Role             from '../../role'

  export default {
    name: 'Questions',
    data: () => ({
      util:Util,
      role:Role,
      loadingTable: true,
      dataTheme: [],
      dataQuestion: [],
      params: {
        theme_id: '',
        status: '',
        level: '',
      },
    }),
    created () {
      this.load()
    },
    methods: {
      load () {
        ThemeService.dispatch('getThemesByUserSurveyTheme', {self: this})
        QuestionService.dispatch('allQuestion', {self: this})
      },
      dataLevels (key) {
        let array = []
        array['F'] = 'Facil'
        array['R'] = 'Regular'
        array['D'] = 'Dificil'
        return array[key]
      },
      change () {
        this.loadingTable = true
        QuestionService.dispatch('allQuestion', {self: this})
      }
    }
  }
</script>

<style scoped>
    td{
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
        max-width: 0px;
    }
</style>