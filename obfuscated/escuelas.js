class AlumnosCurso extends CursosDetalle {

    path() {
        return "alumnos";
    }

    extraConfiguration() {
        return {
            popup: {
                title: "Alumnos por Curso",
                height: 650,
                width: 1100,
            },
            components: {
                filter: {
                    width: 250,
                    height: 70,
                },
                toolbar: {
                    visible: false
                },
                list: {
                    showBorders: true,
                }
            }
        }
    }

    refreshListToolbar() {
        this.list().setToolbarItems(this.listToolbarItems())
    }

    listToolbarItems() {
        return [this.itemInsert(), this.itemExportExcel(), "searchPanel"]
    }

    itemInsert() {
        if (this.getFilterValue("curso") != undefined) {
            return {
                widget: "dxButton",
                location: "before",
                options: {
                    icon: "add",
                    hint: "Agrega",
                    onClick: e => this.insert()
                }
            }
        }
    }

    labelText() {
        return "Alumnos por Curso"
    }

    itemImport() {
        return {
            widget: "dxButton",
            location: "before",
            visible: false,
            options: {
                icon: "group",
                text: "Importa de Excel",
                onClick: e => this.importAlumnos(e)
            }
        }
    }

    importAlumnos() {
        new ImportAlumnos().render();
    }

    showMessageImportacion() {
        return App.ShowMessage([{
            message: "Este proceso permitirá cargar Alumnos de una Planilla Excel, de acuerdo a las siguientes reglas:",
            quotes: false,
            detail: [
                "1. Deben existir las columnas 'Apellido' y 'Nombre' en la Planilla Excel.",
                "2. Los alumnos a importar no deben existir previamente en el curso.",
                "3. Puede existir una columna adicional 'Email'. Si existe el Email no puede repetirse.",
            ]
        }, {
            message: "<i>Importante:",
            quotes: false,
            detail: [
                "- Usted podrá visualizar los datos a importar antes de confirmar la operacion.",
                "- Los renglones con errores se mostrarán pero no generarán nuevos Alumnos."
            ]
        }], { height: 350, width: 650 })
    }

    itemCurso() {
        return super.itemCurso({ deferRendering: false })
    }

    cursoLoadFirst() {
        return false;
    }

    listColumns() {
        return [
            Column.Id(),
            Column.Text({ dataField: "apellido", width: 250 }),
            Column.Text({ dataField: "nombre", width: 250 }),
            Column.Text({ dataField: "email" }),
        ]
    }

    formViewClass() {
        return AlumnosCursoForm;
    }

    excelFileName() {
        return "Alumnos de " + this.getFilterText("curso") + " / " + this.getFilterText("añolectivo");
    }

    exportExcelDialogWidth() {
        return 750
    }

    deleteMessage() {
        return Messages.Build([{
            message: "Borra " + this.generoArticulo() + " ?",
            detail: this.focusedRowValue("apellido") + " " + this.focusedRowValue("nombre")
        }, {
            message: "perteneciente al Curso:",
            detail: this.cursoDescripcion()
        }]);
    }

    generoArticulo() {
        return "el Alumno"
    }

    listOnContentReady(e) {
        this.focusFirstRow();
        this.refreshListToolbar();
        this.refreshContextMenuItems()
    }

}

class AlumnosCursoForm extends FormView {

    transformData(data) {
        return Utils.NormalizeData(data, "id,curso,apellido,nombre,genero,email")
    }

    popupConfiguration() {
        return {
            title: "Alumno",
            width: 600,
            height: 450
        }
    }

    formItems() {
        return [
            Item.Id(),
            Item.ReadOnly({ dataField: "añolectivo", width: 80, label: "Año Lectivo" }),
            Item.ReadOnly({ dataField: "cursodescripcion", label: "Curso" }),
            Item.Text({ dataField: "apellido", required: true, width: 250 }),
            Item.Text({ dataField: "nombre", required: true, width: 250 }),
            Item.Email({ dataField: "email", clearButton: true })
        ]
    }

    firstEditor() {
        return "apellido";
    }

    duplicatedMessage() {
        return Messages.Build([{
            message: "Ya existe un Alumno con Apellido y Nombre:",
            detail: this.getEditorText("apellido") + ", " + this.getEditorText("nombre")
        }, {
            message: "en el Curso:",
            detail: this.listView().cursoDescripcion()
        }])
    }

}

class App extends AppBase {

    static TableNames = new Map()
        .set("materias_cursos", "Materias Dictadas (de Cursos)")
        .set("examenes", "Examenes")

    static DefineViewNormal() {
        return new AppView();
    }

    static Root() {
        return "escuelas"
    }

    static LoadMemoryTables() {
        return Años.Load()
            .then(() =>
                Turnos.Load()
            )
            .then(() =>
                ExamenesTipos.Load()
            )
    }

    static Name() {
        return "Sistema de Escuelas";
    }

    static Version() {
        return "0.0"
    }

    static Host() {
        //return "http://alasoft.sytes.net:9090";
        return "http://127.0.0.1:9090"
    }

    static TranslateTableName(name) {
        let translate = this.TableNames.get(name.trim().toLowerCase());
        if (translate != undefined) {
            return translate;
        } else {
            return Strings.Capitalize(name);
        }

    }

}

class AppView extends AppViewBase {

    toolbarItems() {
        return super.toolbarItems().concat([this.userButton(), this.sistemaButton()])
    }

    userButton() {
        return {
            widget: "dxButton",
            location: "before",
            options: {
                icon: "user",
                text: "Docente: " + App.UserNombreApellido()
            }
        }
    }

    sistemaButton() {
        return {
            widget: "dxButton",
            location: "after",
            options: {
                icon: "bell",
                text: App.ShortName()
            }
        }
    }

    itemsDataSource() {

        const itemDatos = new TreeItem({
            id: "1",
            text: "Datos Generales"
        });

        const itemCalificaciones = new TreeItem({
            id: "2",
            text: "Calificaciones"
        });

        const itemDictado = new TreeItem({
            id: "3",
            text: "Clases",
        })

        const itemSalida = new TreeItem({
            id: "4",
            text: "Cierra Sesión",
            onClick: e => {
                App.BlankViewElement();
                App.YesNo({ message: "Cierra la Sesión ?" }).then(data => {
                    if (data.okey) {
                        App.Login()
                    } else {
                        App.SelectFirstItem()
                    }
                })
            }
        })

        itemDatos.addChild({
            text: "Escuelas",
            onClick: e => new Escuelas().render()
        })

        itemDatos.addChild({
            text: "Modalidades",
            onClick: e => new Modalidades().render()
        })

        itemDatos.addChild({
            text: "Materias Genéricas",
            onClick: e => new Materias().render()
        })

        itemDictado.addChild({
            text: "Cursos",
            onClick: e => new Cursos().render()
        })

        itemDictado.addChild({
            text: "Horarios",
            onClick: e => new MateriasHoras().render()
        })

        itemCalificaciones.addChild({
            text: "Períodos",
            onClick: e => new Periodos().render()
        })

        itemCalificaciones.addChild({
            text: "Valoraciones Pedagógicas",
            onClick: e => new Valoraciones().render()
        })

        itemCalificaciones.addChild({
            text: "Examenes",
            onClick: e => new ExamenesCurso().render()
        })

        itemCalificaciones.addChild({
            text: "Notas",
            onClick: e => new Notas().render()
        })

        return [itemDatos, itemDictado, itemCalificaciones, itemSalida];

    }

}

class AppViewTemplate extends Template {

    extraConfiguration() {
        return {
            name: App.APP_NAME,
            fillContainer: true,
            orientation: "vertical",
            items: [this.title(),
                this.body()
            ]
        }
    }

    title() {
        return {
            name: App.TITLE_NAME,
            backgroundColor: App.BOX_BACKGROUND_COLOR,
            height: 45,
            orientation: "horizontal",
            items: [
                this.toolbar()
            ]
        }
    }

    toolbar() {
        return {
            name: App.TOOLBAR_NAME,
            marginTop: 5,
            marginLeft: 5,
        }
    }

    body() {
        return {
            name: App.BODY_NAME,
            fillContainer: true,
            orientation: "horizontal",
            margin: App.BOX_MARGIN,
            items: [
                this.itemsResizer(),
                this.view()
            ]
        }
    }

    itemsResizer() {
        return {
            name: App.ITEMS_RESIZER_NAME,
            orientation: "vertical",
            width: App.ITEMS_WIDTH,
            marginRight: App.BOX_MARGIN,
            items: [
                this.appItemsLabel(),
                this.appItems()
            ]
        }
    }

    appItemsLabel() {
        return {
            text: "Menú",
            marginBottom: App.LABEL_BOTTOM_MARGIN
        }
    }

    appItems() {
        return {
            name: App.ITEMS_NAME,
            fillContainer: true,
            orientation: "vertical",
            height: 0
        }
    }

    view() {
        return {
            name: App.VIEW_NAME,
            fillContainer: true,
            width: "70%",
            orientation: "vertical",
        }
    }

}

class AñoCursoMateriaFilterView extends FilterView {

    defaultConfiguration() {
        return Utils.Merge(super.defaultConfiguration(), {
            fullScreen: true,
            components: {
                filter: { width: 1100 },
                list: {
                    showColumnLines: true
                }
            }
        })
    }

    filterItems() {
        return [
            Item.Group({
                colCount: 2,
                items: [
                    this.itemAñoLectivo(),
                ]
            }),
            Item.Group({
                colCount: 2,
                items: [
                    this.itemFilterCurso(), this.itemFilterMateriaCurso()
                ]
            })
        ]
    }

    itemAñoLectivo() {
        return Item.Lookup({
            dataField: "añolectivo",
            dataSource: AñosLectivos.DataSource(),
            width: 130,
            label: "Año Lectivo",
            onValueChanged: e =>
                this.itemAñoLectivoOnValueChanged(e)
        })
    }

    itemFilterCurso() {
        return Item.Lookup({
            dataField: "curso",
            label: "Filtra por Curso",
            clearButton: true,
            displayExpr: item =>
                Cursos.Descripcion(item),
            width: 400,
            onValueChanged: e =>
                this.itemCursoOnValueChanged(e)
        })
    }

    itemFilterMateriaCurso(p) {
        return Item.Lookup({
            dataField: "materiacurso",
            label: "Filtra por Materia",
            displayExpr: item =>
                item != null ? item.materianombre : "",
            width: 250,
            clearButton: true,
            onValueChanged: e =>
                this.itemMateriaCursoOnValueChanged(e)
        })
    }

    añoLectivo() {
        return this.getFilterValue("añolectivo");
    }

    curso() {
        return this.getFilterValue("curso")
    }

    materiaCurso() {
        return this.getFilterValue("materiacurso")
    }

    setDataSource() {
        if (this.añoLectivo() != undefined) {
            this.list().setDataSource(Ds({
                path: this.path(),
                filter: { añolectivo: this.añoLectivo(), curso: this.curso(), materiacurso: this.materiaCurso() }
            }))
        } else {
            this.list().setDataSource(null);
        }
    }

    setCursoDataSource() {
        if (this.añoLectivo() != undefined) {
            this.filter().setEditorDataSource("curso",
                Ds({
                    path: "cursos",
                    filter: { añolectivo: this.añoLectivo() },
                })
            );
        } else {
            this.filter().setEditorDataSource("curso", null);
        }
    }

    setMateriaCursoDataSource() {
        if (this.curso() != undefined) {
            this.filter().setEditorDataSource("materiacurso",
                Ds({
                    path: "materias_cursos",
                    filter: { curso: this.curso() },
                }),
            );
        } else {
            this.filter().setEditorDataSource("materiacurso", null);
        }
    }

    itemInsert() {
        if (this.añoLectivo() == Dates.ThisYear()) {
            return super.itemInsert();
        }
    }

    afterRender() {
        super.afterRender();
        this.refreshFilterValue("añolectivo", Dates.ThisYear())
    }

    itemAñoLectivoOnValueChanged(e) {
        this.setDataSource();
        this.setCursoDataSource();
    }

    itemCursoOnValueChanged(e) {
        this.setDataSource();
        this.setMateriaCursoDataSource();
    }

    itemMateriaCursoOnValueChanged(e) {
        this.setDataSource();
    }

}

class AñoLectivoFilterView extends FilterView {

    defaultConfiguration() {
        return Utils.Merge(super.defaultConfiguration(), {
            components: {
                list: {
                    headerFilter: {
                        visible: true
                    },
                    filterPanel: {
                        visible: true,
                        labelLocation: "left"
                    }
                }
            }
        })
    }

    filterItems() {
        return [
            this.itemAñoLectivo(),
        ]
    }

    itemAñoLectivo() {
        return Item.Lookup({
            dataField: "añolectivo",
            dataSource: AñosLectivos.DataSource(),
            width: 130,
            label: "Año Lectivo",
            onValueChanged: e =>
                this.itemAñoLectivoOnValueChanged(e)
        })
    }

    añoLectivo() {
        if (this.filter().instance() != undefined) {
            return this.getFilterValue("añolectivo");
        }
    }

    columnCurso() {
        return Column.Calculated({
            dataField: "curso",
            formula: row => Cursos.Descripcion(row),
            caption: "Curso",
            name: "curso",
            width: 400,
            filterWidth: 600
        })
    }

    itemInsert() {
        if (this.añoLectivo() == Dates.ThisYear()) {
            return super.itemInsert();
        }
    }

    contextItemInsert() {
        if (this.añoLectivo() == Dates.ThisYear()) {
            return super.contextItemInsert();
        }
    }

    setDataSource(añolectivo) {
        if (añolectivo != undefined) {
            this.list().setDataSource(Ds({
                path: this.path(),
                filter: { añolectivo: añolectivo }
            }))
        } else {
            this.list().setDataSource(null);
        }
    }

    formViewDefaultValues(mode) {
        return { añolectivo: this.añoLectivo() }
    }

    setState() {
        super.setState();
        const añolectivo = (this.state.filter && this.state.filter.añolectivo) ? this.state.filter.añolectivo : Dates.ThisYear();
        this.setFilterValue("añolectivo", añolectivo)
    }

    itemAñoLectivoOnValueChanged(e) {
        this.setDataSource(e.value)
    }

    state() {
        return Utils.Merge(super.state(), {
            filter: {
                añolectivo: this.filter().getValue("añolectivo")
            }
        })
    }

}

class Años extends RestMemoryTable {}

class AñosLectivos extends LocalMemoryTable {

    static DefineData() {
        let max = Dates.ThisYear();
        let min = max - 10;
        let years = [];
        for (let year = max; year > min; year--) {
            years.push({ id: year, nombre: year })
        }
        return years;
    }

}

class Cursos extends AñoLectivoFilterView {

    labelText() {
        return "Cursos";
    }

    toolbarItems() {
        return [this.itemInsert(), this.itemAlumnosCurso(), this.itemMateriasCurso()]
    }

    itemAlumnosCurso() {
        if (this.list().hasRows()) {
            return {
                widget: "dxButton",
                location: "before",
                options: {
                    icon: "user",
                    text: "Alumnos",
                    onClick: e => this.alumnosCurso()
                }
            }
        }
    }

    itemMateriasCurso() {
        if (this.list().hasRows()) {
            return {
                widget: "dxButton",
                location: "before",
                options: {
                    icon: "copy",
                    text: "Materias Dictadas",
                    onClick: e => this.materiasCurso()
                }
            }
        }
    }

    itemExamenes() {
        if (this.list().hasRows()) {
            return {
                widget: "dxButton",
                location: "before",
                options: {
                    icon: "background",
                    text: "Trabajos Prácticos",
                    onClick: e => this.examenes()
                }
            }
        }
    }

    alumnosCurso() {
        new AlumnosCurso({
            masterView: this,
            añolectivo: this.añoLectivo(),
            curso: this.id()
        }).render()
    }

    materiasCurso() {
        new MateriasCurso({
            masterView: this,
            añolectivo: this.añoLectivo(),
            curso: this.id()
        }).render()
    }

    examenes() {
        new ExamenesCurso({
            masterView: this,
            añolectivo: this.añoLectivo(),
            curso: this.id(),
        }).render();
    }

    listColumns() {
        return [
            Column.Id(),
            Column.Text({ dataField: "escuelanombre", caption: "Escuela", width: 300, filtering: true }),
            Column.Text({ dataField: "modalidadnombre", caption: "Modalidad" }),
            Column.Invisible({ dataField: "año" }),
            Column.Calculated({ formula: row => Años.GetNombre(row.año), caption: "Año", width: 50 }),
            Column.Text({ dataField: "division", caption: "División" }),
            Column.Calculated({ formula: row => Turnos.GetNombre(row.turno), caption: "Turno" })
        ]
    }

    formViewClass() {
        return CursosForm;
    }

    excelFileName() {
        return "Cursos " + this.getFilterText("añolectivo");
    }

    deleteMessage() {
        return Messages.Build({ message: "Borra el Curso ?", detail: this.cursoDescripcion() })
    }

    deleteErrorMessage(err) {
        return App.ShowMessage([{
            message: "No es posible borrar el Curso",
            detail: this.cursoDescripcion()
        }, {
            message: "debido a que esta vinculado a registros de la Tabla",
            detail: this.relatedTableName(err)
        }])
    }

    cursoDescripcion() {
        return Cursos.Descripcion(this.focusedRowData()) + " / " + this.añoLectivo();
    }

    static Descripcion(data) {
        if (Utils.IsDefined(data)) {
            return Strings.Concatenate([
                data.escuelanombre,
                data.modalidadnombre,
                Años.GetNombre(data.año),
                data.division,
                Turnos.GetNombre(data.turno)
            ], ", ")
        } else {
            return ""
        }
    }

}

class CursosForm extends FormView {

    transformData(data) {
        return Utils.NormalizeData(data, "id,escuela,modalidad,añolectivo,año,division,turno")
    }

    popupConfiguration() {
        return {
            title: "Curso",
            width: 650,
            height: 500
        }
    }

    formItems() {
        return [
            Item.Id(),
            Item.Group({
                items: [
                    Item.ReadOnly({ dataField: "añolectivo", width: 100 }),
                    Item.Lookup({
                        dataField: "escuela",
                        dataSource: Escuelas.DataSource(),
                        required: true,
                        editable: true
                    }),
                    Item.Lookup({
                        dataField: "modalidad",
                        dataSource: Modalidades.DataSource(),
                        width: 250,
                        required: true,
                    })
                ]
            }),
            Item.Group({
                colCount: 2,
                items: [
                    Item.Lookup({
                        dataField: "año",
                        dataSource: Años.DataSource(),
                        required: true
                    }),
                    Item.Text({
                        dataField: "division",
                        required: true,
                        case: "upper",
                        width: 80,
                        label: "División"
                    }),
                ]
            }),
            Item.Group({
                colCount: 2,
                items: [
                    Item.Lookup({
                        dataField: "turno",
                        dataSource: Turnos.DataSource(),
                        required: true,
                    })
                ]
            })
        ]
    }

    firstEditor() {
        return "escuela";
    }

    duplicatedMessage() {
        return Messages.Build({ message: "Ya existe un Curso con los datos:", detail: this.listView().cursoDescripcion() })
    }

}

class CursosBaseView extends View {

    defaultConfiguration() {
        return {
            components: {
                filter: {
                    items: this.filterItems(),
                    labelLocation: "top"
                }
            }
        }
    }

    filterItems() {}

    itemAñoLectivo(p) {
        return Item.Lookup(Utils.Merge({
            dataField: "añolectivo",
            dataSource: AñosLectivos.DataSource(),
            width: 100,
            label: "Año Lectivo",
            onValueChanged: e =>
                this.itemAñoLectivoOnValueChanged(e)
        }, p))
    }

    itemCurso(p) {
        return Item.Lookup(
            Utils.Merge({
                dataField: "curso",
                deferRendering: false,
                width: 450,
                displayExpr: item =>
                    Cursos.Descripcion(item),
                onValueChanged: e =>
                    this.itemCursoOnValueChanged(e)
            }, p))
    }

    itemMateriaCurso(p) {
        return Item.Lookup(Utils.Merge({
            dataField: "materiacurso",
            deferRendering: false,
            width: 250,
            label: "Materia",
            displayExpr: item =>
                item != null ? item.materianombre : "",
            onValueChanged: e =>
                this.itemMateriaCursoOnValueChanged(e)
        }, p))
    }

    filter() {
        return this.components().filter;
    }

    añoLectivo() {
        return this.getFilterValue("añolectivo");
    }

    curso() {
        return this.getFilterValue("curso")
    }

    materiaCurso() {
        return this.getFilterValue("materiacurso")
    }

    getFilterValue(dataField) {
        return this.filter().getValue(dataField);
    }

    getFilterText(dataField) {
        return this.filter().getEditorText(dataField);
    }

    refreshFilterValue(dataField, value) {
        this.filter().refreshEditorValue(dataField, value)
    }

    loadCursos() {
        if (this.añoLectivo() != undefined) {
            return new Rest({ path: "cursos" })
                .promise({
                    verb: "list",
                    data: { añolectivo: this.añoLectivo() }
                }).then(rows =>
                    this.filter().setArrayDataSource("curso", rows))
        } else {
            return Promise.resolve(this.filter().clearEditorDataSource("curso"));
        }
    }

    loadMateriasCursos() {
        if (this.curso() != undefined) {
            return new Rest({ path: "materias_cursos" })
                .promise({
                    verb: "list",
                    data: { curso: this.curso() }
                }).then(rows => {
                    this.filter().setArrayDataSource("materiacurso", rows);
                })
        } else {
            return Promise.resolve(this.filter().clearEditorDataSource("materiacurso"));
        }
    }

    itemAñoLectivoOnValueChanged(e) {}

    itemCursoOnValueChanged(e) {}

    itemMateriaCursoOnValueChanged(e) {}

}

class CursosDetalle extends FilterView {

    defaultConfiguration() {
        return Utils.Merge(super.defaultConfiguration(), {
            mode: "popup",
            popup: {
                title: this.popupTitle(),
                onHidden: e => this.popupOnHidden(e)
            },
            components: {
                filter: {
                    width: 350
                }
            }
        })
    }

    popupTitle() {
        this.labelText();
    }

    filterItems() {
        return [
            Item.Group({
                colCount: 2,
                items: [
                    this.itemAñoLectivo(),
                    this.itemCurso()
                ]
            })
        ]
    }

    itemAñoLectivo(p) {
        return Item.Lookup(
            Utils.Merge({
                dataField: "añolectivo",
                readOnly: this.parameters().añoLectivoReadOnly == true,
                dataSource: AñosLectivos.DataSource(),
                width: 100,
                label: "Año Lectivo",
                onValueChanged: e =>
                    this.itemAñoLectivoOnValueChanged(e)
            }, p))
    }

    itemCurso(p) {
        return Item.Lookup(
            Utils.Merge({
                dataField: "curso",
                readOnly: this.parameters().cursoReadOnly == true,
                deferRendering: false,
                width: 450,
                displayExpr: item =>
                    Cursos.Descripcion(item),
                onValueChanged: e =>
                    this.itemCursoOnValueChanged(e)
            }, p))
    }

    setCursoDataSource(añolectivo) {
        if (añolectivo != undefined) {
            this.filter().setEditorDataSource("curso",
                Ds({
                    path: "cursos",
                    filter: { añolectivo: añolectivo },
                    onLoaded: this.cursoLoadFirst() ? this.filter().onLoadedSetFirstValue("curso") : undefined
                })
            );
        } else {
            this.filter().setEditorDataSource("curso", null);
        }
    }

    cursoLoadFirst() {
        return true;
    }

    setDataSource(curso) {
        if (curso != undefined) {
            this.list().setDataSource(
                Ds({
                    path: this.path(),
                    filter: { curso: curso }
                })
            )
        } else {
            this.list().setDataSource(null);
        }
    }

    afterRender() {
        super.afterRender();
        this.filter().setData(this.filterAfterRenderData());
    }

    filterAfterRenderData() {
        return {
            añolectivo: this.parameters().añolectivo || Dates.ThisYear(),
            curso: this.parameters().curso
        }
    }

    formViewDefaultValues(mode) {
        const curso = this.curso();
        return {
            añolectivo: this.añoLectivo(),
            curso: this.curso(),
            cursodescripcion: this.getFilterText("curso")
        }
    }

    añoLectivo() {
        if (this.filter().instance() != undefined) {
            return this.filter().getEditorValue("añolectivo");
        }
    }

    curso() {
        return this.filter().getEditorValue("curso");
    }

    cursoDescripcion(withAñoLectivo = true) {
        return this.filter().getEditorText("curso") + (withAñoLectivo ? " / " + this.filter().getEditorText("añolectivo") : "")
    }

    itemAñoLectivoOnValueChanged(e) {
        this.setCursoDataSource(e.value);
    }

    itemCursoOnValueChanged(e) {
        this.setDataSource(e.value);
    }

    popupOnHidden(e) {
        if (this.masterView() != undefined) {
            this.masterView().focusRowById(this.curso());
        }
    }

    focus() {
        if (this.parameters().cursoReadOnly == true) {
            this.list().focus()
        } else {
            this.filter().focusEditor("curso");
        }
    }

    closeDataDefault() {
        return Utils.Merge(super.closeDataDefault(), { curso: this.curso() })
    }

}

class CursosMateriasDetalle extends CursosDetalle {

    defaultConfiguration() {
        return Utils.Merge(super.defaultConfiguration(), {
            popup: {
                width: 1000,
                onHidden: e => this.popupOnHidden(e)
            },
            components: {
                filter: {
                    width: 750
                }
            }
        })
    }

    filterItems() {
        return [
            Item.Group({
                colCount: 6,
                items: [
                    this.itemAñoLectivo(),
                    this.itemCurso(),
                    this.itemMateriaCurso()
                ]
            }),
        ]
    }

    itemCurso(p) {
        return super.itemCurso(Utils.Merge({ colSpan: 4 }, p))
    }

    itemMateriaCurso(p) {
        return Item.Lookup(Utils.Merge({
            dataField: "materiacurso",
            readOnly: this.parameters().materiaCursoReadOnly == true,
            deferRendering: false,
            width: 250,
            label: "Materia",
            displayExpr: item =>
                item != null ? item.materianombre : "",
            onValueChanged: e =>
                this.itemMateriaCursoOnValueChanged(e)
        }, p))
    }

    setMateriaCursoDataSource(curso) {
        if (curso != undefined) {
            this.filter().setEditorDataSource("materiacurso",
                Ds({
                    path: "materias_cursos",
                    filter: { curso: curso },
                    onLoaded: this.materiaCursoOnLoaded()
                }),
            );
        } else {
            this.filter().setEditorDataSource("materiacurso", null);
        }
    }

    materiaCursoOnLoaded() {
        if (this.materiaCursoFirstValue == undefined) {
            return this.filter().onLoadedSetFirstValue("materiacurso");
        } else {
            this.materiaCursoFirstValue = undefined;
        }
    }

    filterAfterRenderData() {
        this.materiaCursoFirstValue = this.parameters().materiacurso;
        return Utils.Merge(super.filterAfterRenderData(), { materiacurso: this.materiaCursoFirstValue });
    }

    materiaCurso() {
        return this.getFilterValue("materiacurso");
    }

    materiaNombre() {
        return this.getFilterText("materiacurso");
    }

    itemCursoOnValueChanged(e) {
        this.setMateriaCursoDataSource(e.value);
    }

    itemMateriaCursoOnValueChanged(e) {}

    popupOnHidden(e) {
        if (this.masterView() != undefined) {
            this.masterView().focusRowById(this.materiaCurso());
        }
    }

    closeDataDefault() {
        return { dataHasChanged: this.dataHasChanged, curso: this.curso(), materiaCurso: this.materiaCurso() }
    }

}

class CursosMateriasForm extends FormView {

    añoLectivo() {
        return this.listView().añoLectivo();
    }

    materiaCurso() {
        return this.getEditorValue("materiacurso");
    }

    itemAñoLectivo() {
        return Item.ReadOnly({
            dataField: "añolectivo",
            width: 100
        })
    }

    itemCurso() {
        return Item.Lookup({
            dataField: "curso",
            dataSource: Ds({ path: "cursos", filter: { añoLectivo: this.añoLectivo() } }),
            displayExpr: item => Cursos.Descripcion(item),
            width: 400,
            colSpan: 2,
            required: true,
            onValueChanged: e => this.cursoOnValueChanged(e)
        })
    }

    itemMateriaCurso() {
        return Item.Lookup({
            dataField: "materiacurso",
            displayExpr: item => item != null ? item.materianombre : "",
            deferRendering: false,
            width: 250,
            label: "Materia",
            colSpan: 2,
            required: true,
            onValueChanged: e => this.materiaCursoOnValueChanged(e)
        })
    }

    afterGetData(data) {
        this.firstMateriaCurso = data.materiacurso;
        return data;
    }

    firstEditor() {
        return "curso";
    }

    setMateriaCursoDataSource(curso) {
        if (curso != undefined) {
            this.form().setEditorDataSource("materiacurso",
                Ds({
                    path: "materias_cursos",
                    filter: { curso: curso },
                    onLoaded: data => {
                        if (this.firstMateriaCurso != undefined) {
                            this.setFirstMateriaCurso()
                        }
                    }
                }),
            );
        } else {
            this.filter().setEditorDataSource("materiacurso", null);
        }
    }

    setFirstMateriaCurso() {
        this.setEditorValue("materiacurso", this.firstMateriaCurso);
        this.firstMateriaCurso = undefined;
    }

    cursoDescripcion() {
        return this.getEditorText("curso") + " / " + this.getEditorValue("añolectivo");
    }

    cursoOnValueChanged(e) {
        this.setMateriaCursoDataSource(e.value);
    }

    materiaCursoOnValueChanged(e) {}

}

class DiasCalendario extends View {

    beforeRender() {
        return new Rest({
                path: "materias_horas_all",
            }).promise({
                verb: "list",
                data: { añolectivo: this.parameters().añoLectivo }
            })
            .then(rows =>
                this.transformRows(rows))
            .then(rows =>
                this.dataSource = rows)
    }

    transformRows(rows) {

        function text(row) {
            return row.materianombre + " " +
                Cursos.Descripcion(row) + " " +
                DiasSemana.GetAbrevia(row.dia) + " " +
                row.desde + " - " +
                row.hasta
        }

        function fechaHora(day, hour) {
            let date = Dates.DateFromDayOfWeek(Dates.Today(), day);
            return Dates.SetTime(date, hour)
        }

        rows.forEach(
            row => {
                row.text = text(row);
                row.fechaDesde = fechaHora(row.dia, row.desde);
                row.fechaHasta = fechaHora(row.dia, row.hasta);
            }
        )

        return rows;

    }

    extraConfiguration() {
        return {
            mode: "popup",
            popup: {
                title: "Horarios de Materias",
                fullScreen: true,
                height: window.screen.height - 100,
                width: window.screen.width - 50,
                resizeEnabled: true
            },
            components: {
                scheduler: this.schedulerConfiguration()
            }
        }
    }

    schedulerConfiguration(dataSource) {
        return {
            dataSource: this.dataSource,
            editing: {
                allowDragging: false,
                allowUpdating: false,
                allowAdding: false,
                allowDeleting: false,
                allowResizing: false
            },
            dateCellTemplate: (itemData, itemIndex, itemElement) =>
                $("<div>").text(DiasSemana.GetAbrevia(itemData.date.getDay())).css({
                    "margin": 5
                }),
            appointmentTemplate: model => {
                const data = model.appointmentData;
                return $("<div>").html(data.materianombre +
                    "<br>" +
                    Cursos.Descripcion(data) +
                    "<br><br>" +
                    data.desde + " - " + data.hasta).css({ "font-size": "x-small" })
            },
            height: 350,
            onAppointmentDblClick: (e, a) =>
                e.cancel = true,
            onContentReady: e =>
                this.schedulerOnContentReady(e),
            onAppointmentFormOpening: e =>
                e.cancel = true,
            onCellClick: e =>
                e.cancel = true
        }

    }

    defineTemplate() {
        return new Template({
            fillContainer: true,
            orientation: "vertical",
            items: [{
                name: "scheduler",
                fillContainer: true,
                backgroundColor: "lightyellow",
                orientation: "vertical",
                height: 0
            }]
        })
    }

    schedulerOnContentReady(e) {
        this.template().hideElementByClass("dx-toolbar-items-container");
        this.template().setElementStyleByClass("dx-scheduler-header", { "height": "0px" })
    }

}

class Escuelas extends SimpleListView {

    static DefineDataSource() {
        return App.RegisterDataSource(this, {
            path: "escuelas",
            cache: true
        })
    }

    labelText() {
        return "Escuelas"
    }

    listColumns() {
        return [Column.Id(),
            "nombre"
        ]
    }

    formViewClass() {
        return EscuelasFormView;
    }

    deleteMessage() {
        return Messages.Build({ message: "Borra la Escuela ?", detail: this.focusedRowValue("nombre") })
    }

}

class EscuelasFormView extends FormView {

    popupConfiguration() {
        return {
            title: "Escuela",
            width: 500,
            height: 250
        }
    }

    formItems() {
        return [
            Item.Id(),
            Item.Nombre(),
        ]
    }

    duplicatedMessage() {
        return Messages.Build({ message: "Ya existe un Escuela de nombre:", detail: this.getEditorText("nombre") })
    }

}

class Examenes extends AñoLectivoFilterView {

    path() {
        return "examenes_all";
    }

    extraConfiguration() {
        return {
            mode: "popup",
            popup: {
                title: "Examenes de todas las Materias",
                height: 650,
                width: 1300
            },
            components: {
                list: {
                    showBorders: true
                }
            }
        }
    }

    labelText() {
        return "Trabajos Prácticos";
    }

    listColumns() {
        return [
            Column.Id(),
            this.columnCurso(),
            Column.Text({ dataField: "materianombre", caption: "Materia Dictada", width: 180 }),
            Column.Date({ dataField: "desde", width: 180, caption: "Inicio", format: App.DATE_FORMAT_LONG }),
            Column.Date({ dataField: "hasta", caption: "Cierre", width: 180, format: App.DATE_FORMAT_LONG }),
            Column.Text({ dataField: "nombre", width: 250, caption: "Trabajo Práctico" }),
            Column.Text({ dataField: "periodonombre", caption: "Período", filtering: true, width: 200 }),
        ]
    }

    formViewClass() {
        return TpsForm;
    }

    excelFileName() {
        return "Trabajos Prácticos " + this.getFilterText("añolectivo");
    }

}

class TpsForm extends CursosMateriasForm {

    path() {
        return "examenes";
    }

    transformData(data) {
        return Utils.Merge(Utils.NormalizeData(data, "id,periodo,nombre,desde,hasta"), { materiacurso: this.materiaCurso() })
    }

    popupConfiguration() {
        return {
            title: () => "Trabajo Práctico",
            width: 750,
            height: 500
        }
    }

    formItems() {
        return [
            Item.Id(),
            Item.Group({
                colCount: 2,
                items: [
                    this.itemAñoLectivo(),
                ]
            }),
            Item.Group({
                colCount: 2,
                items: [
                    this.itemCurso(),
                    this.itemMateriaCurso(),
                    Item.Text({
                        dataField: "nombre",
                        required: true,
                        colSpan: 2,
                        placeholder: "Ingrese el Nombre del Trabajo Práctico"
                    }),
                    Item.Lookup({
                        dataField: "periodo",
                        dataSource: Ds({ path: "periodos" }),
                        required: true,
                        width: 500,
                        displayExpr: item => Periodos.Descripcion(item),
                        onValueChanged: e => this.periodoOnValueChanged(e)
                    }),
                ]
            }),
            Item.Group({
                colCount: 2,
                items: [
                    Item.DateLong({
                        dataField: "desde",
                        required: true,
                        label: "Fecha de Inicio",
                    }),
                    Item.Date({
                        dataField: "hasta",
                        required: true,
                        label: "Fecha de Cierre",
                    }),
                ]
            }),

        ]
    }

    beforeRender() {
        return new Rest({ path: "periodos" }).promise({
                verb: "list",
                data: { añoLectivo: this.listView().añoLectivo().id }
            }).then(rows =>
                this.periodos = rows)
            .then(() =>
                Arrays.ToDate(this.periodos, ["desde", "hasta"]))
    }

    afterRender() {
        super.afterRender();
        if (this.isInserting()) {
            if (this.periodoDefault() != undefined) {
                this.setEditorValue("periodo", this.periodoDefault().id);
                this.setEditorValue("desde", this.desdeDefault())
            }
        }
    }

    periodoDefault() {
        if (this._periodoDefault == undefined) {
            this._periodoDefault = this.definePeriodoDefault()
        }
        return this._periodoDefault;
    }

    desdeDefault() {
        if (this._desdeDefault == undefined) {
            this._desdeDefault = this.defineDesdeDefault()
        }
        return this._desdeDefault;
    }

    definePeriodoDefault() {
        let periodo;
        if (0 < this.periodos.length) {
            this.periodos.find(per =>
                Dates.Between(Dates.Today(), per.desde, per.hasta));
            if (periodo == undefined) {
                periodo = this.periodos[0];
            }
        }
        return periodo;
    }

    defineDesdeDefault() {
        let desde = Dates.Today;
        if (!Dates.Between(desde, this.periodoDefault().desde, this.periodoDefault().hasta)) {
            desde = this.periodoDefault().desde;
        }
        return desde;
    }

    periodoOnValueChanged(e) {
        if (this.getEditorValue("desde") != null) {
            this.blankEditorValue("desde");
        }
        if (this.getEditorValue("hasta") != null) {
            this.blankEditorValue("hasta");
        }
    }

    duplicatedMessage() {
        return Messages.Build([{
            message: "Ya existe un Trabajo Práctico con el nombre:",
            detail: this.getEditorValue("nombre")
        }, {
            message: "para la Materia",
            detail: this.getEditorValue("nombre")
        }, {
            message: "para el Curso",
            detail: this.cursoDescripcion()
        }])
    }

}

class ExamenesCurso extends CursosMateriasDetalle {

    path() {
        return "examenes"
    }

    extraConfiguration() {
        return {
            mode: "view",
            popup: {
                title: "Examenes por Curso y Materia",
                height: 600,
                width: 1050
            },
            components: {
                filter: {
                    width: 750,
                },
                list: {
                    showBorders: true
                }
            }
        }
    }

    itemInsert() {
        if (this.getFilterValue("curso") != undefined) {
            return {
                widget: "dxButton",
                location: "before",
                options: {
                    icon: "add",
                    hint: "Agrega",
                    onClick: e => this.insert()
                }
            }
        }
    }

    itemCurso() {
        return super.itemCurso({ deferRendering: this.parameters().materiacurso != undefined })
    }

    labelText() {
        return "Examenes por Curso y Materia"
    }

    setDataSource(materiacurso) {
        if (materiacurso != undefined) {
            this.list().setDataSource(
                Ds({
                    path: this.path(),
                    filter: { materiacurso: materiacurso }
                })
            )
        } else {
            this.list().setDataSource(null);
        }
    }

    listColumns() {
        return [
            Column.Id(),
            Column.Text({ dataField: "periodonombre", caption: "Período", filtering: true }),
            Column.Calculated({ caption: "Tipo", formula: row => ExamenesTipos.GetNombre(row.tipo) }),
            Column.Text({ dataField: "nombre" }),
            Column.Date({ dataField: "desde", width: 200, caption: "Fecha de Inicio", format: App.DATE_FORMAT_LONG }),
            Column.Date({ dataField: "hasta", caption: "Fecha de Cierre", width: 200, format: App.DATE_FORMAT_LONG })
        ]
    }

    formViewClass() {
        return ExamenesCursoForm;
    }

    deleteMessage() {
        return Messages.Build([{
            message: "Borra el Examen ?",
            detail: this.focusedRowValue("nombre")
        }, {
            message: "de la Materia",
            detail: this.getFilterText("materiacurso")
        }, {
            message: "del Curso",
            detail: this.cursoDescripcion()
        }])
    }

    itemMateriaCursoOnValueChanged(e) {
        this.setDataSource(e.value);
    }

    excelFileName() {
        return "Examenes " + this.cursoDescripcion() + " / " + this.getFilterText("materiacurso");
    }

    exportExcelDialogWidth() {
        return 800;
    }

    itemTodos() {
        if (this.configuration().showTodosButton != false) {
            return {
                widget: "dxButton",
                location: "before",
                visible: false,
                options: {
                    text: "Todos los Trabajos Prácticos",
                    icon: "folder",
                    onClick: e => this.todos()
                }
            }
        }
    }

    todos() {
        new Examenes().render()
    }

}

class ExamenesCursoForm extends FormView {

    transformData(data) {
        return Utils.Merge(Utils.NormalizeData(data, "id,periodo,tipo,nombre,desde,hasta"), { materiacurso: this.materiaCurso() })
    }

    popupConfiguration() {
        return {
            title: () => "Examen de " + this.materiaNombre(),
            width: 750,
            height: 500
        }
    }

    formItems() {
        return [
            Item.Group({
                items: [
                    Item.Id(),
                    Item.Group({
                        colCount: 3,
                        items: [
                            Item.ReadOnly({ dataField: "añolectivo", label: "Año Lectivo" }),
                            Item.ReadOnly({ dataField: "cursodescripcion", label: "Curso", colSpan: 2 }),
                        ]
                    }),
                    Item.Text({
                        dataField: "materianombre",
                        readOnly: true,
                        value: this.materiaNombre(),
                        width: 200,
                        label: "Materia"
                    }),
                    Item.Lookup({
                        dataField: "tipo",
                        dataSource: ExamenesTipos.DataSource(),
                        required: true,
                        width: 150,
                        onValueChanged: e => this.examenesTiposOnValueChanged(e)
                    }),
                    Item.Text({
                        dataField: "nombre",
                        required: true,
                        placeholder: "Ingrese el Nombre de la Examen"
                    }),
                    Item.Lookup({
                        dataField: "periodo",
                        dataSource: Ds({ path: "periodos" }),
                        required: true,
                        width: 500,
                        displayExpr: item => Periodos.Descripcion(item),
                        onValueChanged: e => this.periodoOnValueChanged(e)
                    }),
                    Item.Group({
                        colCount: 2,
                        items: [
                            Item.DateLong({
                                dataField: "desde",
                                required: true,
                                label: "Fecha de Inicio",
                                format: App.DATE_FORMAT_LONG,
                                onValueChanged: e => this.desdeOnValueChanged(e)
                            }),
                            Item.DateLong({
                                dataField: "hasta",
                                required: true,
                                label: "Fecha de Cierre",
                                format: App.DATE_FORMAT_LONG
                            })
                        ]
                    }),
                ]
            }),
        ]
    }

    materiaCurso() {
        return this.listView().materiaCurso();
    }

    materiaNombre() {
        return this.listView().materiaNombre();
    }

    firstEditor() {
        return "tipo";
    }

    beforeRender() {
        return new Rest({ path: "periodos" }).promise({
                verb: "list",
                data: { añoLectivo: this.listView().añoLectivo().id }
            }).then(rows =>
                this.periodos = rows)
            .then(() =>
                Arrays.ToDate(this.periodos, ["desde", "hasta"]))
    }

    afterRender() {
        if (this.isInserting()) {
            if (this.periodoDefault() != undefined) {
                this.setEditorValue("periodo", this.periodoDefault().id);
                this.setEditorValue("desde", this.desdeDefault())
            }
        }
    }

    periodoDefault() {
        if (this._periodoDefault == undefined) {
            this._periodoDefault = this.definePeriodoDefault()
        }
        return this._periodoDefault;
    }

    desdeDefault() {
        if (this._desdeDefault == undefined) {
            this._desdeDefault = this.defineDesdeDefault()
        }
        return this._desdeDefault;
    }

    definePeriodoDefault() {
        let periodo;
        if (0 < this.periodos.length) {
            this.periodos.find(per =>
                Dates.Between(Dates.Today(), per.desde, per.hasta));
            if (periodo == undefined) {
                periodo = this.periodos[0];
            }
        }
        return periodo;
    }

    defineDesdeDefault() {
        let desde = Dates.Today;
        if (!Dates.Between(desde, this.periodoDefault().desde, this.periodoDefault().hasta)) {
            desde = this.periodoDefault().desde;
        }
        return desde;
    }

    examenesTiposOnValueChanged(e) {
        const examenTipo = ExamenesTipos.Get(e.value);
        this.setEditorProperty("hasta", "readOnly", examenTipo != undefined && examenTipo.fechaHasta == false)
        if (examenTipo != undefined && examenTipo.fechaHasta == false) {
            this.setEditorValue("hasta", this.getEditorValue("desde"))
        }
    }

    periodoOnValueChanged(e) {
        if (this.getEditorValue("desde") != null) {
            this.blankEditorValue("desde");
        }
        if (this.getEditorValue("hasta") != null) {
            this.blankEditorValue("hasta");
        }
    }

    desdeOnValueChanged(e) {
        const examenTipo = ExamenesTipos.Get(this.getEditorValue("tipo"));
        if (examenTipo != undefined && examenTipo.fechaHasta == false) {
            this.setEditorValue("hasta", this.getEditorValue("desde"))
        }
    }

    duplicatedMessage() {
        return Messages.Build([{
            message: "Ya existe una Examen con el nombre:",
            detail: this.getEditorValue("nombre")
        }, {
            message: "para la Materia",
            detail: this.getEditorValue("nombre")
        }, {
            message: "para el Curso",
            detail: this.cursoDescripcion()
        }])
    }

    cursoDescripcion() {
        return this.getEditorValue("cursodescripcion") + " / " + this.getEditorValue("añolectivo");
    }

    handleError(err) {
        if (err.code == Exceptions.DEBE_ESTAR_DENTRO_PERIODO) {
            this.handleDebeEstarDentroPeriodo(err)
        } else if (err.code == Exceptions.FECHA_ENTREGA_DEBER_SER_MAYOR_IGUAL_INICIO) {
            this.handleEntragaDebeSerMayorIgualInicio(err)
        } else {
            super.handleError(err);
        }
    }

    handleDebeEstarDentroPeriodo(err) {
        App.ShowMessage([{
            message: "Las fechas",
            detail: this.form().getDate("desde") + " / " + this.form().getDate("hasta"),
            quotes: false,
        }, {
            message: "deben estar dentro del Periodo",
            detail: this.getEditorText("periodo"),
            quotes: false
        }])
    }

    handleEntragaDebeSerMayorIgualInicio(err) {
        App.ShowMessage([{
            message: "La fecha de inicio",
            detail: this.getDate("desde"),
        }, {
            message: "debe ser menor o igual a la de Cierre",
            detail: this.getDate("hasta")
        }])
    }

}

class ExamenesTipos extends RestMemoryTable {}

class ImportAlumnos extends View {

    extraConfiguration() {
        return {
            mode: "popup",
            popup: { title: "Importación de Alumnos de planilla Excel" },
            components: {
                toolbar: { items: this.toolbarItems() },
                list: {
                    dataSource: [],
                    keyExpr: "id",
                    columns: [{ dataField: "id", visible: false }, {
                        dataField: "apellido"
                    }, {
                        dataField: "nombre"
                    }, {
                        dataField: "email"
                    }, {
                        dataField: "error"
                    }],
                    groupPanel: {
                        visible: false
                    }
                }
            }
        }
    }

    list() {
        return this.components().list;
    }

    defineTemplate() {
        return new Template({
            fillContainer: true,
            orientation: "vertical",
            items: [{
                    name: "toolbar",
                    backgroundColor: App.BOX_BACKGROUND_COLOR,
                },
                {
                    name: "list",
                    fillContainer: true,
                    orientation: "vertical",
                    height: 0
                }, {
                    name: "contextMenu"
                },
            ]
        })
    }

    toolbarItems() {
        return [this.itemImporta()]
    }

    itemImporta() {
        return {
            widget: "dxButton",
            location: "before",
            options: {
                icon: "exportxlsx",
                text: "Selecciona Archivo Excel",
                focusStateEnabled: false,
                onClick: e => this.importaOnClick(e),
            }
        }
    }

    importaOnClick(e) {
        this.fileSelect().click();
    }

    fileSelect() {
        if (this._fileSelect == undefined) {
            this._fileSelect = this.defineFileSelect()
        }
        return this._fileSelect;
    }

    defineFileSelect() {
        var fileSelect = $("<input type='file' id='file-select' name='file-select' style='display:none' accept='.xls,.xlsx'>");
        fileSelect.appendTo(App.AppElement());
        fileSelect.change(e =>
            this.onfileSelected(e.target.files[0])
        );
        return fileSelect;
    }

    onfileSelected(file) {
        const fileReader = new FileReader();
        fileReader.onload = e => this.onLoadFile(e.target.result);
        fileReader.readAsBinaryString(file);
    }

    onLoadFile(binary) {
        const workbook = XLSX.read(binary, {
            type: 'binary'
        });
        workbook.SheetNames.forEach(sheetName =>
            this.rows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName])
        )
        this.rows = this.rows.map((row, i) => {
            return {
                id: i,
                apellido: this.get(row, "apellido"),
                nombre: this.get(row, "nombre"),
                email: this.get(row, "email")
            }
        })

        this.list().setDataSource(this.rows);
        this.valida();
        this.list().setDataSource(this.rows)
    }

    get(row, dataField) {
        var key = Object.keys(row).find(key => key.toLowerCase() == dataField.toLowerCase());
        if (key != undefined) {
            return row[key];
        }
    }

    valida() {
        this.validaApellidosNombres()
    }

    validaApellidosNombres() {
        this.rows.forEach(row => this.validaApellidoNombre(row))
    }

    validaApellidoNombre(rowToValidate) {
        let duplicate =
            this.rows.find(row =>
                row.id != rowToValidate.id &&
                row.apellido.toLowerCase() == rowToValidate.apellido.toLowerCase() &&
                row.nombre.toLowerCase() == rowToValidate.nombre.toLowerCase()
            )
        if (duplicate != undefined) {
            rowToValidate.error = true
        }
    }

    importa() {

    }

}

class Materias extends SimpleListView {

    static DefineDataSource() {
        return App.RegisterDataSource(this, {
            path: "materias",
            cache: true
        });
    }

    labelText() {
        return "Materias"
    }

    listColumns() {
        return [
            Column.Id(),
            Column.Text({ dataField: "nombre" }),
        ]
    }

    formViewClass() {
        return MateriasForm;
    }

    deleteMessage() {
        return Messages.Build({ message: "Borra la Materia ?", detail: this.focusedRowValue("nombre") })
    }

}

class MateriasForm extends FormView {

    popupConfiguration() {
        return {
            title: "Materia",
            width: 600,
            height: 250
        }
    }

    formItems() {
        return [
            Item.Id(),
            Item.Text({
                dataField: "nombre",
                required: true,
            }),
        ]
    }

    duplicatedMessage() {
        return Messages.Build({ message: "Ya existe una Materia genérica de nombre:", detail: this.getEditorText("nombre") })
    }


}

class MateriasCurso extends CursosDetalle {

    path() {
        return "materias_cursos";
    }

    extraConfiguration() {
        return {
            popup: {
                title: "Materias dictadas en el Curso",
            },
            components: {
                filter: {
                    width: 250,
                    height: 70,
                },
                toolbar: {
                    visible: false
                },
                list: {
                    showBorders: true
                }
            }
        }
    }

    refreshListToolbar() {
        this.list().setToolbarItems(this.listToolbarItems())
    }

    listToolbarItems() {
        return [this.itemInsert(), this.itemHorarios(), this.itemExportExcel(), "searchPanel"]
    }

    labelText() {
        return "Materias por Curso"
    }

    itemCurso() {
        return super.itemCurso({ deferRendering: false })
    }

    cursoLoadFirst() {
        return false;
    }

    listColumns() {
        return [
            Column.Id(),
            Column.Text({
                dataField: "materianombre",
                caption: "Materia",
                width: 300,
            }),
            Column.Text({
                dataField: "horarios",
                template: (container, options) => {
                    $("<div>").html(options.value).appendTo(container)
                }
            })
        ]
    }

    itemSpace() {
        return {
            text: "   ",
            location: "before"
        }
    }

    itemHorarios() {
        if (this.list().hasRows() && this.configuration().showHorarios != false) {
            return {
                widget: "dxButton",
                location: "before",
                options: {
                    text: "Horarios",
                    icon: "event",
                    onClick: e => this.horarios()
                }
            }
        }
    }

    itemExamenes() {
        if (this.list().hasRows()) {
            return {
                widget: "dxButton",
                location: "before",
                options: {
                    text: "Trabajos Prácticos",
                    icon: "file",
                    onClick: e => this.examenes()
                }
            }
        }
    }

    examenes() {
        new ExamenesCurso(this.detailData()).render();
    }

    horarios() {
        new MateriasHorasCurso(this.detailData()).render()
            .then(closeData =>
                closeData.dataHasChanged ? this.refresh(this.id()) : undefined)
    }

    detailData() {
        return {
            masterView: this,
            añolectivo: this.añoLectivo(),
            curso: this.curso(),
            materiacurso: this.id(),
            mode: "popup"
        }
    }

    formViewClass() {
        return MateriasCursoForm;
    }

    deleteMessage() {
        return Messages.Build([{
            message: "Borra la Materia ?",
            detail: this.focusedRowValue("materianombre")
        }, {
            message: "dictada en el Curso",
            detail: this.cursoDescripcion()
        }, this.focusedRowValue("horarios") != "" ? {
            message: "Importante:",
            detail: "<i>Junto con la Materia se borrarán los horarios de la misma<br><br>" + Html.Tab(2) + "( " + this.horariosText() + " )",
            quotes: false
        } : undefined])
    }

    horariosText() {
        return this.focusedRowValue("horarios").replace("<br><br>", ", ")
    }

    rowDescription() {
        return this.focusedRowValue("materianombre");
    }

    listOnContentReady(e) {
        this.focusFirstRow();
        this.refreshListToolbar();
        this.refreshContextMenuItems()
    }

}

class MateriasCursoForm extends FormView {

    transformData(data) {
        return Utils.NormalizeData({
            id: data.id,
            curso: data.curso,
            materia: data.materia
        })
    }

    popupConfiguration() {
        return {
            title: "Materia del Curso",
            width: 600,
            height: 450
        }
    }

    formItems() {
        return [
            Item.Id(),
            Item.ReadOnly({ dataField: "añolectivo", width: 80, label: "Año Lectivo" }),
            Item.ReadOnly({ dataField: "cursodescripcion", label: "Curso" }),
            Item.Lookup({ dataField: "materia", dataSource: Materias.DataSource(), required: true, width: 250 }),
        ]
    }

    firstEditor() {
        return "materia";
    }

    duplicatedMessage() {
        return Messages.Build([{
            message: "Ya esta asociada la Materia:",
            detail: this.getEditorText("materia")
        }, { message: "para el Curso", detail: this.listView().cursoDescripcion() }])
    }

    popupOnHidden(e) {
        if (this.masterView() != undefined) {
            this.masterView().focusRowById(this.curso().id);
        }
    }

}

class MateriasCursoTemplate extends FilterViewTemplate {

    extraItems() {
        return super.extraItems().concat([this.toolbar()])
    }

    toolbar() {
        return {
            name: "toolbar"
        }
    }

}

class MateriasHoras extends AñoLectivoFilterView {

    path() {
        return "materias_horas_all";
    }

    extraConfiguration() {
        return {
            popup: {
                title: "Horarios"
            }
        }
    }

    labelText() {
        return "Horarios de Materias";
    }

    toolbarItems() {
        return [this.itemInsert()]
    }

    itemCalendario() {
        if (this.hasRows()) {
            return {
                widget: "dxButton",
                location: "before",
                options: {
                    icon: "event",
                    text: "Calendario",
                    onClick: e => this.calendario()
                }
            }
        }
    }

    listColumns() {
        return [
            Column.Id(),
            Column.Calculated({
                dataField: "dia",
                width: 130,
                caption: "Dia",
                formula: row => DiasSemana.GetNombre(row.dia),
                sort: (s1, s2) => this.sortDia(s1, s2)
            }),
            Column.Time({ dataField: "desde", width: 130, caption: "Hora Desde", format: App.TIME_FORMAT_SHORT }),
            Column.Time({ dataField: "hasta", caption: "Hora Hasta", width: 130, format: App.TIME_FORMAT_SHORT }),
            this.columnCurso(),
            Column.Text({ dataField: "materianombre", caption: "Materia", width: 150 }),
            Column.Text({ dataField: "escuelanombre", caption: "Escuela", width: 200, filterWidth: 300 })
        ]
    }

    sortDia(s1, s2) {
        const d1 = DiasSemana.GetId(s1);
        const d2 = DiasSemana.GetId(s2);
        if (d1 < d2) {
            return -1;
        }
        if (d1 == d2) {
            return 0;
        }
        return 1;
    }

    setDataSource() {
        if (this.añoLectivo() != undefined) {
            this.list().setDataSource(Ds({
                path: this.path(),
                filter: { añolectivo: this.añoLectivo() }
            }))
        } else {
            this.list().setDataSource(null);
        }
    }

    formViewClass() {
        return MateriasHorasForm;
    }

    calendario() {
        new DiasCalendario({ añoLectivo: this.añoLectivo() }).render();
    }

    excelFileName() {
        return "Horarios " + this.getFilterText("añolectivo");
    }

    deleteMessage() {
        const row = this.focusedRowData();
        return Messages.Build([{
                message: "Borra el horario ?",
                detail: DiasSemana.GetNombre(row.dia) + " " + row.desde.substring(0, 5) + " - " + row.hasta.substring(0, 5)
            },
            {
                message: "de la Materia",
                detail: this.focusedRowValue("materianombre")
            }, {
                message: "perteneciente al Curso:",
                detail: this.cursoDescripcion()
            }
        ]);
    }

    cursoDescripcion() {
        return Cursos.Descripcion(this.focusedRowData()) + " / " + this.getFilterValue("añolectivo")
    }

}

class MateriasHorasForm extends CursosMateriasForm {

    path() {
        return "materias_horas";
    }

    transformData(data) {
        return {
            id: data.id,
            materiacurso: data.materiacurso,
            dia: data.dia,
            desde: Dates.TimeAsString(data.desde),
            hasta: Dates.TimeAsString(data.hasta)
        }
    }

    popupConfiguration() {
        return {
            title: "Horario",
            width: 750,
            height: 450
        }
    }

    formItems() {
        return [
            Item.Id(),
            Item.Group({
                colCount: 2,
                items: [
                    Item.ReadOnly({
                        dataField: "añolectivo",
                        width: 100
                    })
                ]
            }),
            Item.Group({
                colCount: 2,
                items: [
                    this.itemCurso(),
                    this.itemMateriaCurso(),
                    Item.Lookup({
                        dataField: "dia",
                        dataSource: DiasSemana.DataSource(),
                        required: true,
                        width: 130,
                        label: "Dia de la Semana",
                    })
                ]
            }),
            Item.Group({
                colCount: 3,
                items: [
                    Item.Time({
                        dataField: "desde",
                        required: true,
                        label: "Hora desde"
                    }),
                    Item.Time({
                        dataField: "hasta",
                        required: true,
                        label: "Hora hasta",
                    })
                ]
            })

        ]
    }

    afterGetData(data) {
        data.desde = Dates.DateFromHour(data.desde);
        data.hasta = Dates.DateFromHour(data.hasta);
        return super.afterGetData(data)
    }

    cursoOnValueChanged(e) {
        this.setMateriaCursoDataSource(e.value);
    }

}

class MateriasHorasAll extends AñoCursoMateriaFilterView {

    path() {
        return "materias_horas_all";
    }

    labelText() {
        return "Dias y Horas de Materias";
    }

    listToolbarItems() {
        return [this.itemSearchPanel()]
    }

    itemCalendario() {
        return {
            widget: "dxButton",
            location: "after",
            options: {
                icon: "event",
                text: "Calendario",
                onClick: e => this.calendario()
            }
        }
    }

    listColumns() {
        return [
            Column.Id(),
            Column.Calculated({
                dataField: "dia",
                width: 130,
                caption: "Dia",
                formula: row => DiasSemana.GetNombre(row.dia)
            }),
            Column.Date({ dataField: "desde", width: 130, caption: "Desde", format: App.TIME_FORMAT_SHORT }),
            Column.Date({ dataField: "hasta", caption: "Hasta", width: 130, format: App.TIME_FORMAT_SHORT }),
            Column.Calculated({
                dataField: "curso",
                formula: row => Cursos.Descripcion(row),
                caption: "Curso",
                width: 400
            }),
            Column.Text({ dataField: "materianombre", caption: "Materia", width: 150 }),
        ]
    }

    formViewClass() {
        return MateriasHorasAllForm;
    }

    calendario() {
        new DiasCalendario({ añoLectivo: this.añoLectivo() }).render();
    }

}

class MateriasHorasAllForm extends MateriasHorasForm {

    popupConfiguration() {
        return {
            title: "Horario",
            width: 750,
            height: 400
        }
    }

    añoLectivo() {
        return this.listView().añoLectivo();
    }

    materiaCurso() {
        return this.getEditorValue("materiacurso");
    }

    formItems() {
        return [
            Item.Id(),
            Item.Group({
                colCount: 2,
                items: [
                    Item.Lookup({
                        dataField: "curso",
                        dataSource: Ds({ path: "cursos", filter: { añoLectivo: this.añoLectivo() } }),
                        displayExpr: item => Cursos.Descripcion(item),
                        width: 400,
                        colSpan: 2,
                        onValueChanged: e => this.cursoOnValueChanged(e)
                    }),
                    Item.Lookup({
                        dataField: "materiacurso",
                        displayExpr: item => item != null ? item.materianombre : "",
                        width: 250,
                        label: "Materia",
                        colSpan: 2,
                        onValueChanged: e => this.materiaCursoOnValueChanged(e)
                    }),
                    Item.Lookup({
                        dataField: "dia",
                        dataSource: DiasSemana.DataSource(),
                        width: 130,
                        label: "Dia de la Semana",
                    }),

                ]
            }),
            Item.Group({
                colCount: 3,
                items: [
                    Item.Time({
                        dataField: "desde",
                        label: "Hora desde",
                    }),
                    Item.Time({
                        dataField: "hasta",
                        label: "Hora hasta",
                    })
                ]
            })

        ]
    }

    setMateriaCursoDataSource(curso) {
        if (curso != undefined) {
            this.form().setEditorDataSource("materiacurso",
                Ds({
                    path: "materias_cursos",
                    filter: { curso: curso },
                }),
            );
        } else {
            this.filter().setEditorDataSource("materiacurso", null);
        }
    }

    cursoOnValueChanged(e) {
        this.setMateriaCursoDataSource(e.value);
    }

    materiaCursoOnValueChanged(e) {

    }

}

class MateriasHorasCurso extends CursosMateriasDetalle {

    extraConfiguration() {
        return {
            popup: {
                title: "Horarios por Curso y Materia",
            }
        }
    }

    itemCurso() {
        return super.itemCurso({ readOnly: true })
    }

    setDataSource(materiacurso) {
        if (materiacurso != undefined) {
            this.list().setDataSource(
                Ds({
                    path: this.path(),
                    filter: { materiacurso: materiacurso }
                })
            )
        } else {
            this.list().setDataSource(null);
        }
    }

    listColumns() {
        return this.class().ListColumns();
    }

    formViewClass() {
        return MateriasHorasCursoForm;
    }

    itemMateriaCursoOnValueChanged(e) {
        this.setDataSource(e.value)
    }

    path() {
        return "materias_horas";
    }

    deleteMessage() {
        return Messages.Build([{
                message: "Borra este horario ?",
                detail: this.descripcion()
            }, {
                message: "de la Materia",
                detail: this.getFilterText("materiacurso")
            },
            {
                message: "perteneciente al Curso:",
                detail: this.cursoDescripcion()
            }
        ])
    }

    descripcion() {
        const a = "a";
        const row = this.focusedRowData();
        return DiasSemana.GetNombre(row.dia) + ", " + row.desde.substring(0, 5) + " - " + row.hasta.substring(0, 5)
    }

    static ListColumns() {
        return [
            Column.Id(),
            Column.Calculated({
                dataField: "dia",
                width: 300,
                caption: "Dia de la Semana",
                formula: row => DiasSemana.GetNombre(row.dia)
            }),
            Column.Date({ dataField: "desde", width: 200, caption: "Hora Desde", format: App.TIME_FORMAT_SHORT }),
            Column.Date({ dataField: "hasta", caption: "Hora Hasta", format: App.TIME_FORMAT_SHORT }),
            Column.Space()
        ]
    }

}

class MateriasHorasCursoForm extends FormView {

    transformInsertUpdate(data, verb) {
        return Utils.ReduceIds({
            id: data.id,
            materiacurso: this.materiaCurso(),
            dia: data.dia,
            desde: Dates.TimeAsString(data.desde),
            hasta: Dates.TimeAsString(data.hasta)
        })
    }

    popupConfiguration() {
        return {
            title: () => "Horario de " + this.materiaNombre(),
            width: 750,
            height: 400
        }
    }

    formItems() {
        return [
            Item.Id(),
            Item.Group({
                colCount: 3,
                items: [
                    Item.ReadOnly({ dataField: "añolectivo", label: "Año Lectivo" }),
                    Item.ReadOnly({ dataField: "cursodescripcion", label: "Curso", colSpan: 2 }),
                ]
            }),
            Item.Group({
                items: [
                    Item.Text({
                        dataField: "materianombre",
                        readOnly: true,
                        value: this.materiaNombre(),
                        width: 250,
                        label: "Materia"
                    }),
                ]
            }),
            Item.Group({
                items: [
                    Item.Lookup({
                        dataField: "dia",
                        dataSource: DiasSemana.DataSource(),
                        width: 130,
                        label: "Dia de la Semana",
                    })
                ]
            }),
            Item.Group({
                colCount: 3,
                items: [
                    Item.Time({
                        dataField: "desde",
                        label: "Hora desde",
                    }),
                    Item.Time({
                        dataField: "hasta",
                        label: "Hora hasta",
                    })
                ]
            })
        ]
    }

    materiaCurso() {
        return this.listView().materiaCurso();
    }

    materiaNombre() {
        return this.listView().materiaNombre();
    }

    firstEditor() {
        return "dia";
    }

    transformGetData(data) {
        data.desde = Dates.DateFromHour(data.desde);
        data.hasta = Dates.DateFromHour(data.hasta);
        return data;
    }

}

class Modalidades extends SimpleListView {

    static DefineDataSource() {
        return App.RegisterDataSource(this, {
            path: "modalidades",
            cache: true
        });
    }

    labelText() {
        return "Modalidades"
    }

    listColumns() {
        return [Column.Id(),
            "nombre"
        ]
    }

    formViewClass() {
        return ModalidadesForm;
    }

    deleteMessage() {
        return Messages.Build({ message: "Borra la Modalidad ?", detail: this.focusedRowValue("nombre") })
    }

}

class ModalidadesForm extends FormView {

    popupConfiguration() {
        return {
            title: "Modalidad",
            width: 500,
            height: 250
        }
    }

    formItems() {
        return [
            Item.Id(),
            Item.Nombre(),
        ]
    }

    duplicatedMessage() {
        return Messages.Build({ message: "Ya existe una Modalidad de nombre:", detail: this.getEditorText("nombre") })
    }


}

class Notas extends View {

    extraConfiguration() {
        return {
            fullScreen: false,
            components: {
                label: {
                    text: "Notas por Curso y Materia"
                },
                filter: {
                    items: this.filterItems(),
                    labelLocation: "top",
                    width: 750
                },
                list: {
                    keyExpr: "id",
                    focusedRowEnabled: false,
                    dataSource: [],
                    toolbar: {
                        items: this.listToolbarItems()
                    },
                    showBorders: true,
                    wordWrapEnabled: true,
                    hoverStateEnabled: true,
                    columnAutoWidth: true,
                    groupPanel: {
                        visible: false
                    },
                    onCellPrepared: e => this.listOnCellPrepared(e),
                    onKeyDown: e => this.listOnKeyDown(e),
                    onRowDblClick: e => this.listOnRowDblClick(e),
                    onContentReady: e => this.listOnContentReady(e),
                    onDisposing: e => this.listOnDisposing(e)
                },
                contextMenu: {
                    target: this.findElementByClass("list")
                }
            }
        }
    }

    defineTemplate() {
        return new NotasTemplate();
    }

    filterItems() {
        return [
            Item.Group({
                colCount: 6,
                items: [
                    this.itemAñoLectivo(),
                    this.itemCurso(),
                    this.itemMateriaCurso()
                ]
            })
        ]
    }

    itemAñoLectivo() {
        return Item.Lookup({
            dataField: "añolectivo",
            dataSource: AñosLectivos.DataSource(),
            width: 100,
            label: "Año Lectivo",
            onValueChanged: e =>
                this.itemAñoLectivoOnValueChanged(e)
        })
    }

    itemCurso(p) {
        return Item.Lookup({
            dataField: "curso",
            deferRendering: false,
            width: 450,
            colSpan: 4,
            displayExpr: item =>
                Cursos.Descripcion(item),
            onValueChanged: e =>
                this.itemCursoOnValueChanged(e)
        })
    }

    itemMateriaCurso(p) {
        return Item.Lookup({
            dataField: "materiacurso",
            deferRendering: false,
            width: 250,
            label: "Materia",
            displayExpr: item =>
                item != null ? item.materianombre : "",
            onValueChanged: e =>
                this.itemMateriaCursoOnValueChanged(e)
        })
    }

    loadCursos() {
        if (this.añoLectivo() != undefined) {
            new Rest({ path: "cursos" })
                .promise({
                    verb: "list",
                    data: { añolectivo: this.añoLectivo() }
                }).then(rows =>
                    this.filter().setArrayDataSource("curso", rows))
        } else {
            this.filter().clearEditorDataSource("curso");
        }
    }

    loadMateriasCursos() {
        if (this.curso() != undefined) {
            new Rest({ path: "materias_cursos" })
                .promise({
                    verb: "list",
                    data: { curso: this.curso() }
                }).then(rows => {
                    this.filter().setArrayDataSource("materiacurso", rows);
                })
        } else {
            this.filter().clearEditorDataSource("materiacurso");
        }
    }

    refreshContextMenuItems() {
        if (this.contextMenu() != undefined && this.contextMenu().instance() != undefined) {
            this.contextMenu().setItems(this.contextMenuItems());
        }
    }

    contextMenuItems() {
        return [this.itemNotasAlumno()]
    }

    itemNotasAlumno() {
        return {
            text: "Notas del Alumno",
            onClick: e => this.notasAlumno(),
        }
    }

    refresh() {
        return this.notasData().refresh(this.materiaCurso())
            .then(() =>
                this.list().resetColumns(this.columns()))
            .then(() =>
                this.list().setArrayDataSource(this.rows()))
            .then(() =>
                this.loadState())
            .then(() =>
                this.list().focus())
    }

    refreshRows() {
        this.list().setArrayDataSource(this.rows())
    }

    columns() {
        return new NotasColumns(this).columns();
    }

    rows() {
        return new NotasRows(this).rows()
    }

    notasData() {
        if (this._notasData == undefined) {
            this._notasData = new NotasData()
        }
        return this._notasData;
    }

    filter() {
        return this.components().filter;
    }

    list() {
        return this.components().list;
    }

    contextMenu() {
        return this.components().contextMenu;
    }

    listToolbarItems() {
        return [this.itemAlumnos(), this.itemExamenes(), this.itemExcel(), "searchPanel"]
    }

    itemAlumnos() {
        return {
            widget: "dxButton",
            location: "before",
            options: {
                icon: "group",
                text: "Alumnos",
                hint: "Consulta Alumnos del Curso",
                onClick: e => this.alumnos()
            }
        }
    }

    getState() {
        return Utils.Merge(super.getState(), { list: this.list().getState() })
    }

    setState() {
        super.setState();
        this.list()
            .setState(this.state.list || null)
            .focusFirstRow()
    }

    itemExamenes() {
        return {
            widget: "dxButton",
            location: "before",
            options: {
                icon: "background",
                text: "Examenes",
                hint: "Consulta Examenes de la Materia",
                onClick: e => this.examenes()
            }
        }
    }

    itemExcel() {
        return {
            widget: "dxButton",
            location: "after",
            options: {
                icon: "exportxlsx",
                hint: "Exporta a Excel",
                onClick: e => this.exportExcelDialog(e)
            }
        }
    }

    exportExcelDialog(e) {
        new ExportExcelDialog({ fileName: this.excelFileName(), width: 700 }).render()
            .then(data => {
                if (data.okey) {
                    this.exportExcel(e, this.excelFileName())
                }
            })
    }

    excelFileName() {
        return "Notas " + this.getFilterText("curso") +
            " - " +
            this.getFilterText("materiacurso") +
            " / " +
            this.getFilterText("añolectivo")
    }

    exportExcel(e, fileName) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(fileName);

        DevExpress.excelExporter.exportDataGrid({
            component: this.list().instance(),
            worksheet,
            autoFilterEnabled: true,
        }).then(() => {
            workbook.xlsx.writeBuffer().then((buffer) => {
                saveAs(new Blob([buffer], { type: 'application/octet-stream' }), fileName + '.xlsx');
            });
        });
        e.cancel = true;
    }

    alumnos() {
        new AlumnosCurso({
                mode: "popup",
                curso: this.curso(),
                añoLectivoReadOnly: true,
                cursoReadOnly: true
            })
            .render().then(closeData =>
                this.afterAlumnos(closeData))
    }

    afterAlumnos(closeData) {
        if (closeData.dataHasChanged == true) {
            this.refresh()
                .then(() =>
                    this.list().focusRowById(closeData.id))
        } else if (closeData.id != undefined) {
            this.list().focusRowById(closeData.id)
        }
    }

    examenes() {
        new ExamenesCurso({
                mode: "popup",
                showTodosButton: false,
                curso: this.curso(),
                añoLectivoReadOnly: true,
                cursoReadOnly: true,
                materiaCursoReadOnly: true,
                materiacurso: this.materiaCurso()
            }).render()
            .then(closeData =>
                this.afterExamenes(closeData))
    }

    afterExamenes(closeData) {
        if (closeData.dataHasChanged == true) {
            this.refresh()
        }
    }

    getFilterValue(dataField) {
        return this.filter().getValue(dataField);
    }

    getFilterText(dataField) {
        return this.filter().getEditorText(dataField);
    }

    refreshFilterValue(dataField, value) {
        this.filter().refreshEditorValue(dataField, value);
    }

    añoLectivo() {
        return this.getFilterValue("añolectivo");
    }

    curso() {
        return this.getFilterValue("curso")
    }

    materiaCurso() {
        return this.getFilterValue("materiacurso")
    }

    afterRender() {
        if (this.isFullScreen()) {
            App.HideItems();
        }
        this.refreshFilterValue("añolectivo", Dates.ThisYear());
    }

    notasAlumno() {
        new NotasAlumno({
                listView: this
            }).render()
            .then(closeData => {
                if (closeData.dataHasChanged) {
                    this.refreshRows()
                }
            })
    }

    cursoDescripcion() {
        return this.getFilterText("curso") + " / " + this.getFilterValue("añolectivo")
    }

    materiaDescripcion() {
        return this.getFilterText("materiacurso")
    }

    alumnoDescripcion() {
        return this.row("apellido") + ", " + this.row("nombre")
    }

    alumnoStatus() {
        //        return this.notasData().alumnoStatusPresente(this.alumno("id"))
    }

    row(dataField) {
        return this.list().focusedRowValue(dataField)
    }

    alumno() {
        return this.row("id")
    }

    anterior() {
        return this.list().focusPriorRow();
    }

    siguiente() {
        return this.list().focusNextRow()
    }

    itemAñoLectivoOnValueChanged(e) {
        this.loadCursos();
    }

    itemCursoOnValueChanged(e) {
        this.loadMateriasCursos();
    }

    itemMateriaCursoOnValueChanged(e) {
        this.refresh()
    }

    listOnCellPrepared(e) {
        if (e.column.temporalidad == Dates.PASADO || e.column.temporalidad == Dates.FUTURO) {
            e.cellElement.css({
                "background-color": "rgb(225, 228, 228)"
            })
        } else if (e.column.temporalidad == Dates.PRESENTE) {
            e.cellElement.css({
                "background-color": "rgb(181, 238, 220)"
            })
        }
    }

    listOnDisposing(e) {
        this.saveState();
    }

    listOnContentReady(e) {
        this.refreshContextMenuItems()
    }

    listOnRowDblClick(e) {
        this.notasAlumno();
    }

    listOnKeyDown(e) {
        if (e.event.key == "Enter" && this.list().hasRows()) {
            this.notasAlumno()
        }
    }

}

class NotasColumns {

    constructor(notas) {
        this.notas = notas;
        this.notasData = this.notas.notasData();
        this.periodosRows = this.notasData.periodosRows;
    }

    columns() {
        const columns = this.alumnoColumns().concat(this.periodosColumns(), this.anualColumn(), this.emptyColumn());
        return columns;
    }

    alumnoColumns() {
        return [{
                dataField: "id",
                visible: false
            },
            { dataField: "apellido", width: 120, allowReordering: false },
            { dataField: "nombre", width: 0 < this.periodosRows.length ? 120 : undefined, allowReordering: false }
        ]
    }

    periodosColumns() {

        function temporalidadDescripcion(t) {
            if (t == Dates.PASADO) {
                return " / Cerrado"
            } else if (t == Dates.PRESENTE) {
                return " / Vigente"
            } else {
                return ""
            }
        }

        const columns = []
        for (const row of this.periodosRows) {
            columns.push({
                headerCellTemplate: row.nombre + temporalidadDescripcion(row.temporalidad) + "<small><br>" + Dates.DesdeHasta(row.desde, row.hasta),
                alignment: "center",
                temporalidad: row.temporalidad,
                columns: this.periodoColumns(row),
                allowReordering: false,
                allowResizing: true
            })
        }
        return columns;
    }

    periodoColumns(row) {
        return [{
                dataField: "promedio_" + row.id,
                caption: "Promedio",
                temporalidad: row.temporalidad,
                width: 80,
                calculateCellValue: r => row.temporalidad != Dates.FUTURO ? r["periodo_" + row.id].promedio : ""
            },
            {
                dataField: "valoracion_" + row.id,
                caption: "Valoración",
                temporalidad: row.temporalidad,
                width: 90,
                calculateCellValue: r => row.temporalidad != Dates.FUTURO ? r["periodo_" + row.id].valoracion : ""
            },
            {
                dataField: "status_" + row.id,
                caption: "Status",
                temporalidad: row.temporalidad,
                visible: true,
                width: 150,
                calculateCellValue: r => row.temporalidad != Dates.FUTURO ? r["periodo_" + row.id].status : ""
            }
        ]
    }

    anualColumn() {
        return [{
            caption: "Anual",
            alignment: "center",
            columns: this.anualColumns()
        }]
    }

    anualColumns() {
        return [{
                dataField: "promedio_anual",
                caption: "Promedio",
                width: 80,
                calculateCellValue: r => r.total.promedio
            },
            {
                dataField: "valoracion_anual",
                caption: "Valoración",
                width: 90,
                calculateCellValue: r => r.total.valoracion
            }
        ]

    }

    emptyColumn() {
        return {
            //allowResizing: true
        }
    }

}

class NotasRows {

    constructor(notas) {
        this.notas = notas;
        this.notasData = this.notas.notasData();
        this.alumnosRows = this.notasData.alumnosRows;
    }

    rows() {
        const rows = [];
        for (const row of this.alumnosRows) {
            const alumno = { id: row.id, apellido: row.apellido, nombre: row.nombre };
            const promedios = this.notasData.alumnoPromedios(row.id)
            const anual = this.notasData.promedioTotal(promedios)
            rows.push(Object.assign({}, alumno, promedios, anual))
        }
        return rows;
    }

}

class NotasTemplate extends Template {

    extraConfiguration() {
        return {
            fillContainer: true,
            orientation: "vertical",
            items: [
                this.label(),
                this.body(),
            ]
        }
    }

    label() {
        return {
            name: "label",
            marginBottom: App.LABEL_BOTTOM_MARGIN
        }
    }

    body() {
        return {
            fillContainer: true,
            orientation: "vertical",
            padding: App.BOX_PADDING,
            backgroundColor: App.BOX_BACKGROUND_COLOR,
            items: [
                this.filter(),
                this.list(),
                this.contextMenu()
            ]
        }
    }

    filter() {
        return {
            name: "filter",
            orientation: "vertical",
            height: 80
        }
    }

    list() {
        return {
            name: "list",
            fillContainer: true,
            orientation: "vertical",
            height: 1
        }
    }

    contextMenu() {
        return {
            name: "contextMenu"
        }
    }

}

class NotasAlumno extends View {

    extraConfiguration() {
        return {
            mode: "popup",
            popup: {
                title: "Notas por Alumno",
                fullScreen: false,
                width: 1100,
                height: 650
            },
            components: {
                form: {
                    items: this.formItems(),
                    width: 1400
                },
                list: {
                    keyExpr: "id",
                    dataSource: this.rows(),
                    columns: this.columns(),
                    showBorders: true,
                    focusedRowEnabled: false,
                    hoverStateEnabled: true,
                    editing: {
                        mode: "cell",
                        allowUpdating: true,
                        startEditAction: "click",
                        selectTextOnEditStart: true
                    },
                    summary: {
                        groupItems: [{
                            column: "nota",
                            summaryType: "avg",
                            alignment: "left",
                            showInColumn: "periodoNombre",
                            customizeText: data =>
                                this.customizeTextPromedio(data)
                        }],
                        totalItems: [{
                            summaryType: "custom",
                            name: "total",
                            alignment: "left",
                            column: "nota",
                            customizeText: data =>
                                this.customizeTextPromedio(data)
                        }],
                        calculateCustomSummary: options =>
                            this.calculateCustomSummary(options)
                    },
                    onContentReady: e => this.listOnContentReady(e),
                    onCellPrepared: e => this.listOnCellPrepared(e),
                    onEditingStart: e => this.listOnEditingStart(e),
                    onRowUpdating: e => this.listOnRowUpdating(e),
                },
                toolbar: {
                    items: this.toolbarItems()
                }
            }
        }
    }

    customizeTextPromedio(data) {
        if (data.value != undefined) {
            const promedio = Math.round(data.value);
            return promedio + " / " + this.notasData().valoracion(Math.round(data.value))
        } else {
            return "";
        }
    }

    calculateCustomSummary(options) {
        if (options.name == "total") {
            if (options.summaryProcess == "calculate") {
                options.totalValue = this.alumnoPromedioAnual.total.promedio
            }
        }
    }

    defineTemplate() {
        return new NotasAlumnoTemplate()
    }

    form() {
        return this.components().form;
    }

    list() {
        return this.components().list;
    }

    formItems() {
        return [
            Item.Group({
                colCount: 6,
                items: [
                    Item.ReadOnly({ dataField: "curso", width: 400, colSpan: 2 }),
                    Item.ReadOnly({ dataField: "materia", width: 300 }),
                ]
            }),
            Item.Group({
                colCount: 6,
                items: [
                    Item.ReadOnly({ dataField: "alumno", width: 300, colSpan: 2, template: () => this.alumnoTemplate() }),
                    Item.ReadOnly({ dataField: "status", width: 200, template: () => this.estadoTemplate(), visible: false })
                ]
            })
        ]
    }

    alumnoTemplate() {
        this._alumnoTemplate = $("<div>").css({ "font-style": "italic", "font-weight": "bold", "font-size": "14px" });
        return this._alumnoTemplate;
    }

    estadoTemplate() {
        this._alumnoEstado = $("<div>").addClass("font-label");
        return this._alumnoEstado;
    }

    refreshAlumnoTemplate() {
        this._alumnoTemplate.text(this.listView().alumnoDescripcion())
    }

    columns() {
        return [
            Column.Id(),
            Column.Calculated({ caption: "Tipo", formula: row => ExamenesTipos.GetNombre(row.tipo), width: 150 }),
            Column.Text({ dataField: "nombre", caption: "Nombre", editing: false, width: 270 }),
            Column.Text({ dataField: "nota", caption: "Nota", dataType: "number", format: "##", width: 100, editor: this.notaEditor }),
            Column.Text({ dataField: "periodoNombre", caption: "Período", editing: false, width: 250 }),
            Column.Calculated({ caption: "Inicia", formula: row => Dates.Format(row.desde), width: 150 }),
            Column.Calculated({ caption: "Cierre", formula: row => Dates.Format(row.hasta) }),
        ]
    }

    notaEditor(cellElement, cellInfo) {
        return $("<div>").dxNumberBox({
            value: cellInfo.value,
            min: 1,
            max: 10,
            showSpinButtons: true,
            onValueChanged: e => cellInfo.setValue(e.value)
        })
    }

    toolbarItems() {
        return [this.itemSalida(), this.itemAnterior(), this.itemSiguiente()]
    }

    itemSalida() {
        return {
            widget: "dxButton",
            location: "before",
            options: {
                icon: "close",
                text: "Salida",
                onClick: e => this.salida()
            }
        }
    }

    itemAnterior() {
        return {
            widget: "dxButton",
            location: "after",
            options: {
                icon: "arrowleft",
                text: "Anterior",
                onClick: e => this.anterior()
            }
        }
    }

    itemSiguiente() {
        return {
            widget: "dxButton",
            location: "after",
            options: {
                icon: "arrowright",
                text: "Siguiente",
                onClick: e => this.siguiente()
            }
        }
    }

    salida() {
        this.checkEdit().then(() =>
            this.close())
    }

    anterior() {
        this.checkEdit().then(() => {
            if (this.listView().anterior()) {
                this.refresh()
            }
        })
    }

    siguiente() {
        this.checkEdit().then(() => {
            if (this.listView().siguiente()) {
                this.refresh()
            }
        })
    }

    checkEdit() {
        if (this.list().isEditing()) {
            return this.list().saveEdit()
        } else {
            return Promise.resolve()
        }
    }

    listView() {
        return this.parameters().listView;
    }

    notasData() {
        return this.listView().notasData()
    }

    alumno() {
        return this.listView().alumno();
    }

    rows(forceRefresh = false) {
        if (this._rows == undefined || forceRefresh) {
            this._rows = this.defineRows()
        }
        return this._rows;
    }

    defineRows() {
        this.refreshPromedioAnual();
        return new NotasAlumnosRows(this).rows();
    }

    refreshPromedioAnual() {
        this.alumnoPromedioAnual = this.notasData().alumnoPromedioAnual(this.alumno())
    }

    refresh() {
        this.refreshForm();
        this.refreshPromedioAnual();
        this.list().setArrayDataSource(this.rows(true))
        this.list().focus()
    }

    refreshForm() {
        this.refreshFormData();
        this.refreshAlumnoTemplate()
    }

    refreshFormData() {
        this.form().setData({
            curso: this.listView().cursoDescripcion(),
            materia: this.listView().materiaDescripcion(),
        })
    }

    afterRender() {
        super.afterRender()
            .then(() => {
                this.refreshForm();
            })
    }

    saveNota(p) {
        Promise.resolve(this.notasData().saveNota(p.examen, p.alumno, p.nota))
            .then(() =>
                this.alumnoPromedioAnual = this.notasData().alumnoPromedioAnual(p.alumno))
            .then(() =>
                new Rest({ path: "notas" }).promise({
                    verb: "update",
                    data: {
                        examen: p.examen,
                        alumno: p.alumno,
                        nota: p.nota
                    }
                }))
            .then(() =>
                this.dataHasChanged = true)
            .catch(err =>
                this.handleError(err, p))
    }

    handleError(err, p) {
        if (err.code == Exceptions.NOTA_OUT_OF_RANGE) {
            return App.ShowMessage({ message: "La nota debe estar entre 1 y 10" })
                .then(() =>
                    this.list().updateRow(this.row("id"), { nota: p.notaAnterior || null }))
                .then(() =>
                    this.list().focus())
        } else {
            return super.handleError(err)
        }
    }

    row(dataField) {
        return this.list().focusedRowValue(dataField)
    }

    closeDataDefault() {
        return { dataHasChanged: this.dataHasChanged }
    }

    listOnContentReady(e) {
        this.list().focus()
    }

    listOnRowUpdating(e) {
        this.saveNota({
            examen: e.oldData.id,
            alumno: this.alumno(),
            nota: e.newData.nota,
            notaAnterior: e.oldData.nota
        });
    }

    getState() {
        return Utils.Merge(super.getState(), { list: this.list().getState() })
    }

    setState() {
        super.setState();
        this.list()
            .setState(this.state.list || null)
            .focusFirstRow()
    }

    listOnEditingStart(e) {
        if (e.data.temporalidad == Dates.FUTURO) {
            e.cancel = true;
            App.ShowMessage([{
                message: "No es posible ingresar una nota para el Examen",
                detail: e.data.nombre
            }, {
                message: "ya que su fecha de inicio",
                detail: Dates.Format(e.data.desde)
            }, {
                message: "es futura"
            }])
        }
    }

    listOnCellPrepared(e) {
        if (this.esFuturo(e)) {
            this.estiloFuturo(e)
        } else if (e.rowType == "data" && e.column.caption == "Nota") {
            this.estiloNota(e)
        }
    }

    popupOnHiding(e) {
        this.saveState().then(() =>
            super.popupOnHiding(e)
        );
    }

    esFuturo(e) {
        if (e.rowType == "group") {
            const row = this.notasData().getPeriodoRowByName(e.data.key);
            if (row != undefined && row.temporalidad == Dates.FUTURO) {
                return true;
            }
        } else if (e.rowType == "data") {
            if (e.data.temporalidad == Dates.FUTURO) {
                return true;
            }
        }
        return false;
    }

    estiloFuturo(e) {
        e.cellElement.css({
            "background-color": "rgb(236, 243, 243)"
        })
    }

    estiloNota(e) {
        e.cellElement.css({
            "background-color": "rgb(181, 238, 220)"
        })
    }

}

class NotasAlumnosRows {

    constructor(notasAlumnos) {
        this.notasAlumnos = notasAlumnos;
        this.notasData = this.notasAlumnos.notasData();
        this.examenesRows = this.notasData.examenesRows;
    }

    rows() {
        const rows = []
        for (const row of this.examenesRows) {
            rows.push({
                id: row.id,
                tipo: row.tipo,
                nombre: row.nombre,
                desde: row.desde,
                hasta: row.hasta,
                periodo: row.periodo,
                periodoNombre: row.periodonombre,
                nota: this.notasData.getNota(row.id, this.notasAlumnos.alumno()),
                temporalidad: this.notasData.getExamenRow(row.id).temporalidad
            })
        }
        return rows;
    }

}

class NotasAlumnoTemplate extends Template {

    extraConfiguration() {
        return {
            fillContainer: true,
            orientation: "vertical",
            items: [
                this.form(),
                this.list(),
                this.toolbar(),
            ]
        }
    }


    form() {
        return {
            name: "form",
            orientation: "vertical",
            marginTop: 15,
            height: 100
        }
    }

    list() {
        return {
            name: "list",
            fillContainer: true,
            orientation: "vertical",
            height: 1
        }
    }

    toolbar() {
        return {
            name: "toolbar",
            marginTop: 10,
        }
    }

}

class Periodos extends AñoLectivoFilterView {

    labelText() {
        return "Períodos";
    }

    listColumns() {
        return [
            Column.Text({ dataField: "nombre", caption: "Nombre", width: 300 }),
            Column.Date({
                dataField: "desde",
                width: 300,
            }),
            Column.Date({
                dataField: "hasta"
            }),
        ]
    }

    formViewClass() {
        return PeriodosFormView;
    }

    deleteMessage() {
        const data = this.focusedRowData();
        return Messages.Build([{
            message: "Borra el Período ?",
            detail: data.nombre
        }, {
            message: "Del",
            detail: Dates.Format(data.desde, true) + " al " + Dates.Format(data.hasta, true),
            quotes: false
        }])
    }

    excelFileName() {
        return "Períodos " + this.getFilterText("añolectivo");
    }

    static Descripcion(data) {
        if (Utils.IsDefined(data)) {
            return Strings.Concatenate([
                data.nombre + ": ",
                Dates.Format(data.desde) + " al ",
                Dates.Format(data.hasta)
            ])
        } else {
            return ""
        }
    }

}

class PeriodosFormView extends FormView {

    popupConfiguration() {
        return {
            title: "Período",
            width: 550,
            height: 400
        }
    }

    formItems() {
        return [
            Item.ReadOnly({ dataField: "añolectivo", width: 100 }),
            Item.Text({ dataField: "nombre", required: true }),
            Item.Date({ dataField: "desde", required: true, }),
            Item.Date({ dataField: "hasta", required: true, })
        ]
    }

    firstEditor() {
        return "nombre";
    }

    handleError(err) {
        if (err.code == Exceptions.FECHA_DESDE_DEBE_SER_MENOR_FECHA_HASTA) {
            this.handleFechaDesdeDebeSerMenor(err)
        } else if (err.code == Exceptions.PERIODO_INTERSECTA_OTRO_PERIODO) {
            this.handlePeriodoIntersecta(err)
        } else if (err.code == Exceptions.PERIODO_CONTIENE_OTRO_PERIODO) {
            this.handlePeriodoContiene(err)
        } else {
            super.handleError(err);
        }
    }

    duplicatedMessage() {
        return Messages.Build({ message: "Ya existe un Período con el nombre:", detail: this.getEditorValue("nombre") })
    }

    handleFechaDesdeDebeSerMenor(err) {
        App.ShowMessage([{
                message: "La fecha desde",
                detail: this.getDate("desde")
            },
            {
                message: "debe ser menor a la fecha hasta",
                detail: this.getDate("hasta")
            }
        ])
    }

    handlePeriodoContiene(err) {
        App.ShowMessage([{
            message: "El " + this.getEditorValue("nombre"),
            quotes: false,
            detail: "Del " + this.getDate("desde") + " al " + this.getDate("hasta")
        }, {
            message: "contiene al Período",
            detail: err.detail.nombre
        }])
    }

    handlePeriodoIntersecta(err) {
        App.ShowMessage([{
            message: "El " + this.getEditorValue("nombre"),
            quotes: false,
            detail: "Del " + this.getDate("desde") + " al " + this.getDate("hasta")
        }, {
            message: "intersecta al " + err.detail.nombre,
            quotes: false,
            detail: "Del " + Dates.Format(err.detail.desde) + " al " + Dates.Format(err.detail.hasta)
        }])
    }

}

class Turnos extends RestMemoryTable {}

class Valoraciones extends AñoLectivoFilterView {

    labelText() {
        return "Valoraciones Pedagógicas";
    }

    listColumns() {
        return [
            Column.Id(),
            Column.Text({ dataField: "nombre", width: 300 }),
            Column.Text({ dataField: "sigla", width: 100 }),
            Column.Text({
                dataField: "desde",
                width: 100
            }),
            Column.Text({
                dataField: "hasta",
                width: 100
            }),
            Column.Space()
        ]
    }

    formViewClass() {
        return ValoracionesFormView;
    }

    deleteMessage() {
        const data = this.focusedRowData();
        return Messages.Build([{
            message: "Borra la Valoración ?",
            detail: data.nombre
        }, {
            message: "para el rango",
            detail: data.desde + " / " + data.hasta,
            quotes: false
        }])
    }

    excelFileName() {
        return "Valoraciónes " + this.getFilterText("añolectivo");
    }

    static Descripcion(data) {
        if (Utils.IsDefined(data)) {
            return Strings.Concatenate([
                data.nombre + ": ",
                Dates.Format(data.desde) + " al ",
                Dates.Format(data.hasta)
            ])
        } else {
            return ""
        }
    }

}

class ValoracionesFormView extends FormView {

    popupConfiguration() {
        return {
            title: "Valoración Pedagógica",
            width: 550,
            height: 400
        }
    }

    formItems() {
        return [
            Item.Group({
                colCount: 1,
                items: [
                    Item.ReadOnly({ dataField: "añolectivo", width: 100 }),
                    Item.Text({ dataField: "nombre", required: true }),
                    Item.Text({ dataField: "sigla", required: true, width: 100, case: "upper" }),
                ]
            }),
            Item.Group({
                colCount: 3,
                items: [Item.Number({
                        dataField: "desde",
                        required: true,
                        spin: true,
                        min: 1,
                        max: 10,
                        width: 70,
                        value: undefined
                    }),
                    Item.Number({
                        dataField: "hasta",
                        required: true,
                        spin: true,
                        min: 1,
                        max: 10,
                        width: 70,
                        value: undefined
                    })
                ]
            })
        ]
    }

    validateDesdeHasta(e, message) {
        let desde = this.form().getEditorValue("desde");
        let hasta = this.form().getEditorValue("hasta");
        return Dates.Compare(desde, hasta) <= 1
    }

    firstEditor() {
        return "nombre";
    }

    handleError(err) {
        if (err.code == Exceptions.SIGLA_DUPLICATED) {
            this.handleSiglaDuplicatedMessage(err)
        }
        if (err.code == Exceptions.NOTA_DESDE_DEBE_SER_MENOR_IGUAL_NOTA_HASTA) {
            this.handleNotaDesdeDebeSerMenorHasta(err)
        } else if (err.code == Exceptions.RANGO_NOTAS_INTERSECTA_OTRO_RANGO) {
            this.handleNotasIntersecta(err)
        } else if (err.code == Exceptions.RANGO_NOTAS_CONTIENE_OTRO_RANGO) {
            this.handleNotasContiene(err)
        } else {
            super.handleError(err);
        }
    }

    duplicatedMessage() {
        return Messages.Build({ message: "Ya existe una Valoración con el nombre:", detail: this.getEditorValue("nombre") })
    }

    handleSiglaDuplicatedMessage(err) {
        return Messages.Build({ message: "Ya existe una Valoración con la sigla:", detail: this.getEditorValue("sigla") })
    }

    handleNotaDesdeDebeSerMenorHasta(err) {
        App.ShowMessage([{
                message: "La nota desde",
                detail: this.getValue("desde")
            },
            {
                message: "debe ser menor a la nota hasta",
                detail: this.getValue("hasta")
            }
        ])
    }

    handleNotasIntersecta(err) {
        App.ShowMessage([{
            message: "La valoración " + this.getSingleQuotes("sigla"),
            quotes: false,
            detail: this.getValue("desde") + " - " + this.getValue("hasta")
        }, {
            message: "intersecta a la valoración " + Strings.SingleQuotes(err.detail.sigla),
            quotes: false,
            detail: err.detail.desde + " - " + err.detail.hasta
        }])
    }

    handleNotasContiene(err) {
        App.ShowMessage([{
            message: "La valoración " + this.getSingleQuotes("nombre"),
            quotes: false,
            detail: "Del " + this.getValue("desde") + " - " + this.getValue("hasta")
        }, {
            message: "contiene a la Valoración " + Strings.SingleQuotes(err.detail.sigla),
            quotes: false,
            detail: err.detail.desde + " - " + err.detail.hasta
        }])
    }

}

class AppBase {

    static APP_NAME = "app";
    static TITLE_NAME = "appTitle";
    static BODY_NAME = "appBody";
    static TOOLBAR_NAME = "appToolbar";
    static ITEMS_RESIZER_NAME = "appItemsResizer";
    static ITEMS_NAME = "appItems";
    static VIEW_NAME = "appView";

    static BOX_BACKGROUND_COLOR = "white";
    static BOX_MARGIN = 7;
    static BOX_PADDING = 10;
    static LABEL_BOTTOM_MARGIN = 3;
    static ITEMS_WIDTH = 250;

    static FONT_INPUT = "font-input";
    static FONT_READ_ONLY = "font-read-only";

    static NUMBER_FORMAT = "######"
    static NUMBER_WIDTH = 150;

    static DATE_FORMAT = "dd MMM yyyy"
    static DATE_FORMAT_LONG = "dd MMM yyyy, EEE"

    static DATE_WIDTH = 150;
    static DATE_WIDTH_LONG = 180;

    static TIME_FORMAT = "HH:mm"
    static TIME_FORMAT_SHORT = "HH:mm"

    static TIME_WIDTH = 100;

    static EMAIL_WIDTH = 400;

    static POPUP_BACKGROUND_COLOR = "white";
    static POPUP_PREFFIX_ID = "appPopup";

    static KEY_NAME = "id";

    static FILTER_HEIGHT = 70;

    static DISPLAY_EXPR = "nombre";

    static MESSAGE_TITLE = "Atención"
    static VALIDATION_MESSAGE_TITLE = "Atención"
    static ERROR_MESSAGE_TITLE = "Error"
    static INTERNAL_ERROR_MESSAGE_TITLE = "Error Interno"

    static UNIDENTIFIED_ERROR_MESSAGE = "Ha ocurrido un error";

    static ZONA_HORARIA_ARGENTINA = "America/Argentina/Buenos_Aires";
    static BASE_DATE = "1900 01 01";

    static CLIENT_DESCRIPTION_HEADER = "client_description"

    static USER_TEST_DATA = {
        email: "test@test.com",
        password: "test"
    }

    static Init() {
        return this.Localize()
            .then(() =>
                this.Login())
    }

    static InitUser(user) {
        return this.Localize()
            .then(() =>
                this.LoginUser(user));
    }

    static InitUserTest() {
        return this.InitUser(this.USER_TEST_DATA);
    }

    static InitTest() {
        return this.BeginTest()
            .then(() =>
                this.Localize())
            .then(() =>
                this.LoginUser(this.USER_TEST_DATA))
    }

    static BeginTest() {
        return Promise.resolve(this._IsTesting = true);
    }

    static IsTesting() {
        return this._IsTesting == true;
    }

    static Localize(language = "es") {
        return Promise.resolve(DevExpress.localization.locale(language));
    }

    static Login() {
        return this.ClearSession()
            .then(() =>
                this.LoginUserView())
            .then(closeData =>
                this.AfterLogin(closeData))
    }

    static LoginUser(data) {
        return this.ClearSession()
            .then(() =>
                this.LoginUserRest(data))
            .then(closeData =>
                this.AfterLogin(closeData))
    }

    static ClearSession() {
        return Promise.resolve(this.ClearUser())
            .then(() =>
                this.ClearDataSources())
            .then(() =>
                $("body").empty());
    }

    static LoginUserView() {
        return new LoginView().render();
    }

    static LoginUserRest(data) {
        return new Rest({ path: "users" }).promise({
                verb: "login",
                data: data
            })
            .then(user =>
                App.SetUser(user))
            .then(() => {
                return { okey: true }
            })
    }

    static AfterLogin(closeData) {
        if (closeData.okey) {
            return this.LoadMemoryTables().then(() =>
                this.ReloadView())
        } else {
            return this.Exit()
        }
    }

    static LoadMemoryTables() {
        return Promise.resolve();
    }

    static View() {
        if (this._View == undefined) {
            this._View = this.DefineView()
        }
        return this._View;
    }

    static DefineView() {
        if (this.IsTesting()) {
            return this.ViewTest()
        } else {
            return this.ViewNormal()
        }
    }

    static ViewNormal() {
        if (this._ViewNormal == undefined) {
            this._ViewNormal = this.DefineViewNormal()
        }
        return this._ViewNormal;
    }

    static ViewTest() {
        if (this._ViewTest == undefined) {
            this._ViewTest = this.DefineViewTest()
        }
        return this._ViewTest;
    }

    static DefineViewNormal() {
        return new AppViewBase();
    }

    static DefineViewTest() {
        return new AppViewTest();
    }

    static ReloadView() {
        this._View = undefined;
        this._ViewNormal = undefined;
        this._ViewTest = undefined;
        this.View().render();
    }

    static AppElement() {
        return this.View().findElementByClass(this.APP_NAME);
    }

    static TitleElement() {
        return this.View().findElementByClass(this.TITLE_NAME);
    }

    static ItemsResizerElement() {
        return this.View().findElementByClass(this.ITEMS_RESIZER_NAME)
    }

    static ItemsElement() {
        return this.View().findElementByClass(this.ITEMS_NAME)
    }

    static ViewElement() {
        return this.View().findElementByClass(this.VIEW_NAME)
    }

    static BlankViewElement() {
        this.ViewElement().empty();
    }

    static ToggleItems() {
        Html.ToggleVisibility(this.ItemsResizerElement())
    }

    static HideItems() {
        Html.Hide(this.ItemsResizerElement())
    }

    static ItemsAreHide() {
        return !Html.IsVisible(this.ItemsResizerElement());
    }

    static Url(path, verb) {
        return encodeURI(Strings.Concatenate([this.Host(), this.Root(), path, verb], "/"));
    }

    static Host() {
        return "http://127.0.0.1:9090";
    }

    static Root() {
        return "test"
    }

    static GetUser() {
        const json = sessionStorage.getItem("user");
        const user = JSON.parse(json);
        return user != null ? user : {};
    }

    static GetToken() {
        return this.GetUser().token;
    }

    static SetUser(user) {
        sessionStorage.setItem("user", JSON.stringify(user));
    }

    static ClearUser() {
        this.SetUser(null);
    }

    static ShowMessage(p1, p2) {
        return new MessageView(Utils.Merge({ message: Messages.Build(p1) }, p2)).render();
    }

    static ShowError(parameters) {
        return new ErrorView(parameters).render();
    }

    static YesNo(parameters) {
        return new YesNoView(parameters).render();
    }

    static Exit() {
        window.location.href = "about:blank";
    }

    static Title(title) {
        return Strings.Concatenate([this.FullName(), title], " - ")
    }

    static Name() {
        return "Sistema de "
    }

    static ShortName() {
        return this.Name() + " " + this.Version()
    }

    static FullName() {
        return "Sistema de " + this.ShortName();
    }

    static Version() {
        return "0.0"
    }

    static UserNombreApellido() {
        const user = this.GetUser();
        return Strings.Concatenate([user.nombre, user.apellido])
    }

    static UserId() {
        return this.GetUser().id;
    }

    static SelectFirstItem() {
        this.View().selectFirstItem();
    }

    static RegisterDataSource(viewClass, parameters) {
        const dataSource = Ds(parameters);
        this.DataSources().set(viewClass, dataSource);
        return dataSource;
    }

    static DataSources() {
        if (this._DataSources == undefined) {
            this._DataSources = new Map();
        }
        return this._DataSources;
    }

    static ClearDataSources() {
        this.DataSources().forEach((dataSource, viewClass) =>
            viewClass.ClearDataSource())
    }

}

class AppToolbarBase extends Toolbar {

    extraConfiguration() {
        return {
            items: this.items()
        }
    }

    items() {
        return [this.toggleAppItems()]
    }

    toggleAppItems() {
        return {
            widget: "dxButton",
            location: "before",
            option: {
                icon: "menu",
                onClick: e => App.ToggleItems()
            }
        }
    }

}

class AppViewBase extends View {

    defaultConfiguration() {
        return Utils.Merge(super.defaultConfiguration(), {
            element: "body",
            components: {
                toolbar: {
                    componentClass: Toolbar,
                    templateClass: App.TOOLBAR_NAME,
                    items: this.toolbarItems()
                },
                itemsResizer: {
                    componentClass: Resizer,
                    templateClass: App.ITEMS_RESIZER_NAME,
                },
                items: {
                    componentClass: TreeItems,
                    templateClass: App.ITEMS_NAME,
                    dataSource: this.itemsDataSource(),
                    onFocusedRowChanged: e => this.itemsOnFocusedRowChanged(e)
                }

            }
        })
    }

    items() {
        return this.components().items;
    }

    defineTemplate() {
        return new AppViewTemplate();
    }

    toolbarItems() {
        return [this.toggleItemsButton()]
    }

    toggleItemsButton() {
        return {
            widget: "dxButton",
            location: "before",
            options: {
                icon: "menu",
                onClick: e => App.ToggleItems()
            }
        }
    }

    itemsDataSource() {}

    itemsOnFocusedRowChanged(e) {
        if (e.row.data.onClick) {
            e.row.data.onClick();
        } else {
            App.BlankViewElement();
        }
    }

    selectFirstItem() {
        this.items().focusFirstRow();
    }

}

class AppViewTest extends AppViewBase {

}

class LoginView extends EntryView {

    count = 0;
    maxAllowed = 3;

    constructor(parameters) {
        super(parameters);
    }

    path() {
        return "users";
    }

    popupConfiguration() {
        return {
            title: App.Title("Ingreso de Usuario"),
            width: 600,
            height: 350,
        }
    }

    formItems() {
        return [
            Item.Group({
                items: [
                    Item.Email({ required: true })
                ]
            }),
            Item.Group({
                colCount: 2,
                items: [
                    Item.Password(),
                    Item.RecoverPassword({ visible: false })
                ]
            }),
            Item.Group({
                items: [
                    Item.ToglePassword({
                        form: () => this.form()
                    })
                ]
            })

        ]
    }

    toolbarItems() {
        return super.toolbarItems().concat([
            ToolbarItem.WantToRegister({
                onClick: e => this.register(e)
            })
        ])
    }

    okey() {
        this.validate()
            .then(() =>
                this.login())
            .then(user =>
                App.SetUser(user))
            .then(() =>
                this.close(this.closeDataOkey()))
            .catch(err =>
                this.handleError(err)
            );
    }

    login() {
        return this.rest().promise({
            verb: "login",
            data: this.dataToSend()
        });
    }

    dataToSend() {
        return Utils.ReduceObject(this.getData(), ["email", "password"])
    }

    register(e) {
        new RegisterView().render()
            .then(closeData =>
                this.form().clearData())
            .then(() =>
                this.form().focus());
    }

    handleError(err) {
        if (err.code == Exceptions.USER_EMAIL_NOT_FOUND) {
            this.handleUserEmailNotFound(err)
        } else if (err.code == Exceptions.USER_INVALID_PASSWORD) {
            this.handleInvalidPassword(err)
        } else {
            super.handleError(err)
        }
    }

    handleUserEmailNotFound(err) {
        ++this.count;
        App.ShowMessage({
                message: "<i>" + Messages.EMAIL_INGRESADO_NO_CORRESPONDE,
                lineFeed: 3,
                tab: 0,
                quotes: false,
                detail: Messages.POR_FAVOR_REGISTRESE
            })
            .then(closeData =>
                this.count == this.maxAllowed ? this.closeAboveMaxAllowed() : undefined)
    }

    handleInvalidPassword(err) {
        ++this.count;
        App.ShowMessage({
                message: "<i>" + Messages.COMBINACION_EMAIL_PASSWORD_INCORRECTA,
                detail: Messages.POR_FAVOR_VERIFIQUE,
                lineFeed: 3,
                tab: 0,
                quotes: false
            })
            .then(closeData =>
                this.count == this.maxAllowed ? this.closeAboveMaxAllowed() : undefined)
    }

    checkMaxAllowed() {
        if (++this.count == this.maxAllowed) {
            this.close(this.closeDataAboveMaxAllowed());
        }
    }

    closeAboveMaxAllowed() {
        this.close({ okey: false, aboveMaxAllowed: true });
    }

    loadState() {

    }

}

class RegisterView extends EntryView {

    constructor(parameters) {
        super(parameters);
    }

    path() {
        return "users";
    }

    extraConfiguration() {
        return {
            popup: {
                title: App.Title("Nuevo Usuario"),
                width: 700,
            }
        }
    }

    formItems() {
        return [
            Item.Nombre(),
            Item.Apellido(),
            Item.Email(),
            Item.RepeatEmail(),
            Item.Password(),
            Item.RepeatPassword(),
            Item.ToglePassword({
                onClick: e => this.form().toglePasswords(["password", "repeatPassword"])
            })
        ]
    }

    okey() {
        this.validate()
            .then(() =>
                this.register())
            .then(() =>
                this.exitMessage())
            .then(() =>
                this.close(this.closeDataOkey()))
            .catch(err =>
                this.handleError(err))
    }

    validate() {
        return new Promise((resolve, reject) => {
            this.formValidate().then(() => {
                if (this.email() != this.repeatEmail()) {
                    reject(Exceptions.Validation({ message: "<i>El Email ingresado no coincide con su repetición." }))
                }
                if (this.password().length < 8) {
                    reject(Exceptions.Validation({ message: "<i>El password ingresado debe tener al menos 8 caracteres." }))
                }
                if (this.password() != this.repeatPassword()) {
                    reject(Exceptions.Validation({ message: "<i>El password ingresado no coincide con su repeticion." + Messages.PorFavorVerifique(3) }))
                }
                resolve(true)
            }).catch(err =>
                reject(err)
            )
        })
    }

    handleError(err) {
        if (err.code == Exceptions.APELLIDO_NOMBRE_DUPLICATED) {
            this.handleApellidoNombreDuplicado(err)
        } else
        if (err.code == Exceptions.EMAIL_DUPLICATED) {
            this.handleEmailDuplicado(err)
        } else {
            super.handleError(err);
        }
    }

    handleApellidoNombreDuplicado(err) {
        App.ShowMessage([{
            message: "Ya existe un Usuario con Apellido y Nombre",
            detail: Strings.Concatenate([this.apellido(), this.nombre()], ", ")
        }])
    }

    handleEmailDuplicado(err) {
        App.ShowMessage([{
                message: "Ya existe un Usuario con el correo:",
                detail: this.email()
            },
            {
                message: "por favor ingrese otra dirección de correo electrónico"
            }
        ])
    }

    apellido() {
        return this.getData().apellido;
    }

    nombre() {
        return this.getData().nombre;
    }

    email() {
        return this.getData().email;
    }

    repeatEmail() {
        return this.getData().repeatEmail;
    }

    password() {
        return this.getData().password;
    }

    repeatPassword() {
        return this.getData().repeatPassword;
    }

    register() {
        return this.rest().promise({
            verb: "register",
            data: this.dataToSend()
        })
    }

    dataToSend() {
        return Utils.ReduceObject(this.getData(), ["apellido", "nombre", "email", "password"]);
    }

    exitMessage() {
        return App.ShowMessage({ message: "La registración ha sido exitosa" })
    }

    loadState() {

    }

}

class Samples {

    static Persons(rows = 1000) {
        const dataSource = [];
        for (let i = 0; i < rows; i++) {
            dataSource.push({ id: i, firstName: "firstName " + i, lastName: "lastName " + i });
        }
        return dataSource;
    }

    static MultiColumns(parameters) {
        return new MultiColumns(parameters);
    }


}

class MultiColumns {

    constructor(parameters = {}) {
        this.rowsCount = parameters.rowsCount || 100;
        this.columnsCount = parameters.columnsCount || 30;
        this.columnsWidth = parameters.columnsWidth || 50

    }

    dataSource() {
        const dataSource = [];
        for (let i = 0; i < this.rowsCount; i++) {
            dataSource.push(this.row(i));
        }
        return dataSource;
    }

    row(i) {
        const row = {
            id: i
        };
        for (let j = 0; j < this.columnsCount - 1; j++) {
            row["columna" + j] = j;
        }
        return row;
    }

    columns() {
        const columns = [{
            dataField: "id",
            width: this.columnsWidth,
            fixed: true
        }];
        for (let i = 0; i < this.columnsCount - 1; i++) {
            columns.push({
                dataField: "columna" + i,
                width: this.columnsWidth
            })
        }
        return columns;

    }
}

class Users {

    static GetState(data) {
        return new Rest({ path: "user_state" }).promise({
            verb: "get",
            data: Utils.Merge(data, { user: App.UserId() })
        })
    }

    static SaveState(data) {
        return new Rest({ path: "user_state" }).promise({
            verb: "save",
            data: Utils.Merge(data, { user: App.UserId() })
        })
    }

}

class DataSource {

    constructor(parameters) {
        this.path = parameters.path;
        this.loadMode = parameters.cache == true ? "raw" : "processed";
        this.filter = parameters.filter;
        this.transformData = parameters.transformData;
        this.onLoaded = parameters.onLoaded
    }

    rest() {
        if (this._rest == undefined) {
            this._rest = this.defineRest()
        }
        return this._rest;
    }

    defineRest() {
        return new Rest({ path: this.path })
    }

    configuration() {
        return {
            path: this.path,
            key: App.KEY_NAME,
            loadMode: this.loadMode,
            load: searchData => {
                return this.rest().promise({
                        verb: "list",
                        data: this.listData(searchData)
                    })
                    .then(data =>
                        this.transformData != undefined ? this.transformData(data) : data)
                    .catch(err =>
                        Errors.Handle(err).then(closeData => { throw err })
                    )
            },
            byKey: this.cache == true ? undefined : key =>
                this.rest().promise({
                    verb: "get",
                    data: {
                        [App.KEY_NAME]: key
                    }
                }),
            onLoaded: data => {
                if (this.onLoaded != undefined) {
                    this.onLoaded(data)
                }
            }
        }
    }

    listData(searchData) {

        function descripcion() {
            if (searchData != undefined && searchData.searchValue != undefined) {
                return searchData.searchValue;
            }
        }

        return Utils.Merge({ descripcion: descripcion() }, Utils.Evaluate(this.filter))

    }

}

function Ds(parameters) {
    return new DevExpress.data.CustomStore(new DataSource(parameters).configuration())
}

function DsArray(parameters) {
    return new DevExpress.data.DataSource({
        store: {
            type: "array",
            key: App.KEY_NAME,
            data: parameters.rows
        }
    })
}

class BaseMemoryTable extends ObjectBase {

    static DataSource() {
        if (this._DataSource == undefined) {
            this._DataSource = this.DefineDataSource()
        }
        return this._DataSource;
    }

    static DefineDataSource() {
        return DsArray({ rows: this.Data() })
    }

    static Get(data) {
        if (this.Data() != undefined) {
            return this.Data().find(item => item.id == Utils.ReduceId(data));
        }
    }

    static GetNombre(id) {
        const item = this.Get(id);
        return item ? item.nombre : "";
    }

    static GetId(nombre) {
        const item = this.Data().find(item => item.nombre == nombre);
        return item ? item.id : undefined;
    }

}

class LocalMemoryTable extends BaseMemoryTable {

    static Data() {
        if (this._Data == undefined) {
            this._Data = this.DefineData()
        }
        return this._Data;
    }

}

class RestMemoryTable extends BaseMemoryTable {

    static Load() {
        return new Rest({ path: this.Path() }).list()
            .then(data =>
                this._Data = data);
    }

    static Path() {
        return this.ClassName().toLowerCase();
    }

    static Data() {
        return this._Data;
    }

}

class Rest {

    constructor(parameters) {
        this.path = parameters.path;
    }

    list() {
        return this.promise({ verb: "list" })
    }

    get(data) {
        return this.promise({ verb: "get", data: data })
    }

    insert(data) {
        return this.promise({ verb: "insert", data: data })
    }

    update(data) {
        return this.promise({ verb: "update", data: data })
    }

    delete(data) {
        return this.promise({ verb: "delete", data: data })
    }

    promise(parameters) {
        const url = App.Url(this.path, parameters.verb);
        const headers = this.headers(parameters.verb);
        const type = "POST";
        const data = Utils.IsEmptyObject(parameters.data) ? undefined : parameters.data;
        return new Promise((resolve, reject) => $.ajax({
            url: url,
            headers: headers,
            type: type,
            data: JSON.stringify(data),
            success: data =>
                resolve(data),
            error: err => {
                reject(Errors.ErrorObject(err))
            }
        }))
    }

    headers() {
        return Utils.Merge(this.constructor.Headers, {
            token: App.GetToken()
        })
    }

    static Headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
    }

    static Promise(parameters) {
        const url = App.Url(parameters.path);
        const data = Utils.IsEmptyObject(parameters.data) ? undefined : JSON.stringify(parameters.data);
        const headers = Utils.Merge(this.Headers, { token: App.GetToken() })
        return new Promise((resolve, reject) => $.ajax({
            url: url,
            headers: headers,
            data: data,
            type: "POST",
            dataType: "json",
            success: data =>
                resolve(data),
            error: err => {
                reject(Errors.ErrorObject(err))
            }

        }))
    }

}











class Component extends ObjectBase {

    element() {
        if (this._element == undefined) {
            this._element = this.defineElement();
        }
        return this._element;
    }

    defineElement() {
        return this.configuration().element || this.defaultElement();
    }

    defaultElement() {
        return App.ViewElement();
    }

    html() {
        return this.element()[0].outerHTML;
    }

}

var DateFormat = {};

(function($) {
  var daysInWeek          = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var shortDaysInWeek     = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var shortMonthsInYear   = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var longMonthsInYear    = ['January', 'February', 'March', 'April', 'May', 'June',
                              'July', 'August', 'September', 'October', 'November', 'December'];
  var shortMonthsToNumber = { 'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
                              'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12' };

  var YYYYMMDD_MATCHER = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.?\d{0,3}[Z\-+]?(\d{2}:?\d{2})?/;

  $.format = (function() {
    function numberToLongDay(value) {
      // 0 to Sunday
      // 1 to Monday
      return daysInWeek[parseInt(value, 10)] || value;
    }

    function numberToShortDay(value) {
      // 0 to Sun
      // 1 to Mon
      return shortDaysInWeek[parseInt(value, 10)] || value;
    }

    function numberToShortMonth(value) {
      // 1 to Jan
      // 2 to Feb
      var monthArrayIndex = parseInt(value, 10) - 1;
      return shortMonthsInYear[monthArrayIndex] || value;
    }

    function numberToLongMonth(value) {
      // 1 to January
      // 2 to February
      var monthArrayIndex = parseInt(value, 10) - 1;
      return longMonthsInYear[monthArrayIndex] || value;
    }

    function shortMonthToNumber(value) {
      // Jan to 01
      // Feb to 02
      return shortMonthsToNumber[value] || value;
    }

    function parseTime(value) {
      // 10:54:50.546
      // => hour: 10, minute: 54, second: 50, millis: 546
      // 10:54:50
      // => hour: 10, minute: 54, second: 50, millis: ''
      var time = value,
          hour,
          minute,
          second,
          millis = '',
          delimited,
          timeArray;

      if(time.indexOf('.') !== -1) {
        delimited = time.split('.');
        // split time and milliseconds
        time   = delimited[0];
        millis = delimited[delimited.length - 1];
      }

      timeArray = time.split(':');

      if(timeArray.length >= 3) {
        hour   = timeArray[0];
        minute = timeArray[1];
        // '20 GMT-0200 (BRST)'.replace(/\s.+/, '').replace(/[a-z]/gi, '');
        // => 20
        // '20Z'.replace(/\s.+/, '').replace(/[a-z]/gi, '');
        // => 20
        second = timeArray[2].replace(/\s.+/, '').replace(/[a-z]/gi, '');
        // '01:10:20 GMT-0200 (BRST)'.replace(/\s.+/, '').replace(/[a-z]/gi, '');
        // => 01:10:20
        // '01:10:20Z'.replace(/\s.+/, '').replace(/[a-z]/gi, '');
        // => 01:10:20
        time = time.replace(/\s.+/, '').replace(/[a-z]/gi, '');
        return {
          time:    time,
          hour:    hour,
          minute:  minute,
          second:  second,
          millis:  millis
        };
      }

      return { time : '', hour : '', minute : '', second : '', millis : '' };
    }


    function padding(value, length) {
      var paddingCount = length - String(value).length;
      for(var i = 0; i < paddingCount; i++) {
        value = '0' + value;
      }
      return value;
    }

    return {

      parseDate: function(value) {
        var values,
            subValues;

        var parsedDate = {
          date:       null,
          year:       null,
          month:      null,
          dayOfMonth: null,
          dayOfWeek:  null,
          time:       null
        };

        if(typeof value == 'number') {
          return this.parseDate(new Date(value));
        } else if(typeof value.getFullYear == 'function') {
          parsedDate.year       = String(value.getFullYear());
          // d = new Date(1900, 1, 1) // 1 for Feb instead of Jan.
          // => Thu Feb 01 1900 00:00:00
          parsedDate.month      = String(value.getMonth() + 1);
          parsedDate.dayOfMonth = String(value.getDate());
          parsedDate.time       = parseTime(value.toTimeString() + '.' + value.getMilliseconds());
        } else if(value.search(YYYYMMDD_MATCHER) != -1) {
          /* 2009-04-19T16:11:05+02:00 || 2009-04-19T16:11:05Z */
          values = value.split(/[T\+-]/);
          parsedDate.year       = values[0];
          parsedDate.month      = values[1];
          parsedDate.dayOfMonth = values[2];
          parsedDate.time       = parseTime(values[3].split('.')[0]);
        } else {
          values = value.split(' ');
          if(values.length === 6 && isNaN(values[5])) {
            // values[5] == year
            /*
             * This change is necessary to make `Mon Apr 28 2014 05:30:00 GMT-0300` work
             * like `case 7`
             * otherwise it will be considered like `Wed Jan 13 10:43:41 CET 2010
             * Fixes: https://github.com/phstc/jquery-dateFormat/issues/64
             */
            values[values.length] = '()';
          }
          switch (values.length) {
            case 6:
              /* Wed Jan 13 10:43:41 CET 2010 */
              parsedDate.year       = values[5];
              parsedDate.month      = shortMonthToNumber(values[1]);
              parsedDate.dayOfMonth = values[2];
              parsedDate.time       = parseTime(values[3]);
              break;
            case 2:
              /* 2009-12-18 10:54:50.546 */
              subValues = values[0].split('-');
              parsedDate.year       = subValues[0];
              parsedDate.month      = subValues[1];
              parsedDate.dayOfMonth = subValues[2];
              parsedDate.time       = parseTime(values[1]);
              break;
            case 7:
              /* Tue Mar 01 2011 12:01:42 GMT-0800 (PST) */
            case 9:
              /* added by Larry, for Fri Apr 08 2011 00:00:00 GMT+0800 (China Standard Time) */
            case 10:
              /* added by Larry, for Fri Apr 08 2011 00:00:00 GMT+0200 (W. Europe Daylight Time) */
              parsedDate.year       = values[3];
              /* edited by Andrey, for Mon 18 Apr 2016 -//-: '[Day] [Month]' format (russian) */
              var parsedVal1 = parseInt(values[1]);
              var parsedVal2 = parseInt(values[2]);
              if (parsedVal1 && !parsedVal2) {
                  parsedDate.month  = shortMonthToNumber(values[2]);
                  parsedDate.dayOfMonth = values[1];
              } else {
                  parsedDate.month = shortMonthToNumber(values[1]);
                  parsedDate.dayOfMonth = values[2];
              }
              parsedDate.time = parseTime(values[4]);
              break;
            case 1:
              /* added by Jonny, for 2012-02-07CET00:00:00 (Doctrine Entity -> Json Serializer) */
              subValues = values[0].split('');
              parsedDate.year       = subValues[0] + subValues[1] + subValues[2] + subValues[3];
              parsedDate.month      = subValues[5] + subValues[6];
              parsedDate.dayOfMonth = subValues[8] + subValues[9];
              parsedDate.time       = parseTime(subValues[13] + subValues[14] + subValues[15] + subValues[16] + subValues[17] + subValues[18] + subValues[19] + subValues[20]);
              break;
            default:
              return null;
          }
        }

        if(parsedDate.time) {
          parsedDate.date = new Date(parsedDate.year, parsedDate.month - 1, parsedDate.dayOfMonth, parsedDate.time.hour, parsedDate.time.minute, parsedDate.time.second, parsedDate.time.millis);
        } else {
          parsedDate.date = new Date(parsedDate.year, parsedDate.month - 1, parsedDate.dayOfMonth);
        }

        parsedDate.dayOfWeek = String(parsedDate.date.getDay());

        return parsedDate;
      },

      date : function(value, format) {
        try {
          var parsedDate = this.parseDate(value);

          if(parsedDate === null) {
            return value;
          }

          var year       = parsedDate.year,
              month      = parsedDate.month,
              dayOfMonth = parsedDate.dayOfMonth,
              dayOfWeek  = parsedDate.dayOfWeek,
              time       = parsedDate.time;
          var hour;

          var pattern      = '',
              retValue     = '',
              unparsedRest = '',
              inQuote      = false;

          /* Issue 1 - variable scope issue in format.date (Thanks jakemonO) */
          for(var i = 0; i < format.length; i++) {
            var currentPattern = format.charAt(i);
            // Look-Ahead Right (LALR)
            var nextRight      = format.charAt(i + 1);

            if (inQuote) {
              if (currentPattern == "'") {
                retValue += (pattern === '') ? "'" : pattern;
                pattern = '';
                inQuote = false;
              } else {
                pattern += currentPattern;
              }
              continue;
            }
            pattern += currentPattern;
            unparsedRest = '';
            switch (pattern) {
              case 'ddd':
                retValue += numberToLongDay(dayOfWeek);
                pattern = '';
                break;
              case 'dd':
                if(nextRight === 'd') {
                  break;
                }
                retValue += padding(dayOfMonth, 2);
                pattern = '';
                break;
              case 'd':
                if(nextRight === 'd') {
                  break;
                }
                retValue += parseInt(dayOfMonth, 10);
                pattern = '';
                break;
              case 'D':
                if(dayOfMonth == 1 || dayOfMonth == 21 || dayOfMonth == 31) {
                  dayOfMonth = parseInt(dayOfMonth, 10) + 'st';
                } else if(dayOfMonth == 2 || dayOfMonth == 22) {
                  dayOfMonth = parseInt(dayOfMonth, 10) + 'nd';
                } else if(dayOfMonth == 3 || dayOfMonth == 23) {
                  dayOfMonth = parseInt(dayOfMonth, 10) + 'rd';
                } else {
                  dayOfMonth = parseInt(dayOfMonth, 10) + 'th';
                }
                retValue += dayOfMonth;
                pattern = '';
                break;
              case 'MMMM':
                retValue += numberToLongMonth(month);
                pattern = '';
                break;
              case 'MMM':
                if(nextRight === 'M') {
                  break;
                }
                retValue += numberToShortMonth(month);
                pattern = '';
                break;
              case 'MM':
                if(nextRight === 'M') {
                  break;
                }
                retValue += padding(month, 2);
                pattern = '';
                break;
              case 'M':
                if(nextRight === 'M') {
                  break;
                }
                retValue += parseInt(month, 10);
                pattern = '';
                break;
              case 'y':
              case 'yyy':
                if(nextRight === 'y') {
                  break;
                }
                retValue += pattern;
                pattern = '';
                break;
              case 'yy':
                if(nextRight === 'y') {
                  break;
                }
                retValue += String(year).slice(-2);
                pattern = '';
                break;
              case 'yyyy':
                retValue += year;
                pattern = '';
                break;
              case 'HH':
                retValue += padding(time.hour, 2);
                pattern = '';
                break;
              case 'H':
                if(nextRight === 'H') {
                  break;
                }
                retValue += parseInt(time.hour, 10);
                pattern = '';
                break;
              case 'hh':
                /* time.hour is '00' as string == is used instead of === */
                hour = (parseInt(time.hour, 10) === 0 ? 12 : time.hour < 13 ? time.hour
                    : time.hour - 12);
                retValue += padding(hour, 2);
                pattern = '';
                break;
              case 'h':
                if(nextRight === 'h') {
                  break;
                }
                hour = (parseInt(time.hour, 10) === 0 ? 12 : time.hour < 13 ? time.hour
                    : time.hour - 12);
                retValue += parseInt(hour, 10);
                // Fixing issue https://github.com/phstc/jquery-dateFormat/issues/21
                // retValue = parseInt(retValue, 10);
                pattern = '';
                break;
              case 'mm':
                retValue += padding(time.minute, 2);
                pattern = '';
                break;
              case 'm':
                if(nextRight === 'm') {
                  break;
                }
                retValue += parseInt(time.minute,10);
                pattern = '';
                break;
              case 'ss':
                /* ensure only seconds are added to the return string */
                retValue += padding(time.second.substring(0, 2), 2);
                pattern = '';
                break;
              case 's':
                if(nextRight === 's') {
                  break;
                }
                retValue += parseInt(time.second,10);
                pattern = '';
                break;
              case 'S':
              case 'SS':
                if(nextRight === 'S') {
                  break;
                }
                retValue += pattern;
                pattern = '';
                break;
              case 'SSS':
                retValue +=  padding(time.millis.substring(0, 3), 3);
                pattern = '';
                break;
              case 'a':
                retValue += time.hour >= 12 ? 'PM' : 'AM';
                pattern = '';
                break;
              case 'p':
                retValue += time.hour >= 12 ? 'p.m.' : 'a.m.';
                pattern = '';
                break;
              case 'E':
                retValue += numberToShortDay(dayOfWeek);
                pattern = '';
                break;
              case "'":
                pattern = '';
                inQuote = true;
                break;
              default:
                retValue += currentPattern;
                pattern = '';
                break;
            }
          }
          retValue += unparsedRest;
          return retValue;
        } catch (e) {
          if(console && console.log) {
            console.log(e);
          }
          return value;
        }
      },
      /*
       * JavaScript Pretty Date
       * Copyright (c) 2011 John Resig (ejohn.org)
       * Licensed under the MIT and GPL licenses.
       *
       * Takes an ISO time and returns a string representing how long ago the date
       * represents
       *
       * ('2008-01-28T20:24:17Z') // => '2 hours ago'
       * ('2008-01-27T22:24:17Z') // => 'Yesterday'
       * ('2008-01-26T22:24:17Z') // => '2 days ago'
       * ('2008-01-14T22:24:17Z') // => '2 weeks ago'
       * ('2007-12-15T22:24:17Z') // => 'more than 5 weeks ago'
       *
       */
      prettyDate : function(time) {
        var date;
        var diff;
        var abs_diff;
        var day_diff;
        var abs_day_diff;
        var tense;

        if(typeof time === 'string' || typeof time === 'number') {
          date = new Date(time);
        }

        if(typeof time === 'object') {
          date = new Date(time.toString());
        }

        diff = (((new Date()).getTime() - date.getTime()) / 1000);

        abs_diff = Math.abs(diff);
        abs_day_diff = Math.floor(abs_diff / 86400);

        if(isNaN(abs_day_diff)) {
          return;
        }

        tense = diff < 0 ? 'from now' : 'ago';

        if(abs_diff < 60) {
          if(diff >= 0)
            return 'just now';
          else
            return 'in a moment';
        } else if(abs_diff < 120) {
          return '1 minute ' + tense;
        } else if(abs_diff < 3600) {
          return Math.floor(abs_diff / 60) + ' minutes ' + tense;
        } else if(abs_diff < 7200) {
          return '1 hour ' + tense;
        } else if(abs_diff < 86400) {
          return Math.floor(abs_diff / 3600) + ' hours ' + tense;
        } else if(abs_day_diff === 1) {
          if(diff >= 0)
            return 'Yesterday';
          else
            return 'Tomorrow';
        } else if(abs_day_diff < 7) {
          return abs_day_diff + ' days ' + tense;
        } else if(abs_day_diff === 7) {
          return '1 week ' + tense;
        } else if(abs_day_diff < 31) {
          return Math.ceil(abs_day_diff / 7) + ' weeks ' + tense;
        } else {
          return 'more than 5 weeks ' + tense;
        }
      },
      toBrowserTimeZone : function(value, format) {
        return this.date(new Date(value), format || 'MM/dd/yyyy HH:mm:ss');
      }
    };
  }());
}(DateFormat));
;// require dateFormat.js
// please check `dist/jquery.dateFormat.js` for a complete version
(function($) {
  $.format = DateFormat.format;
}(jQuery));

class DiasSemana extends LocalMemoryTable {

    static DefineData() {

        return [{
                id: 1,
                nombre: "Lunes",
                abrevia: "Lun"
            },
            {
                id: 2,
                nombre: "Martes",
                abrevia: "Mar"
            },
            {
                id: 3,
                nombre: "Miercoles",
                abrevia: "Mie"
            },
            {
                id: 4,
                nombre: "Jueves",
                abrevia: "Jue"
            },
            {
                id: 5,
                nombre: "Viernes",
                abrevia: "Vie"
            },
            {
                id: 6,
                nombre: "Sabado",
                abrevia: "Sab"
            },
        ]
    }

    static GetAbrevia(id) {
        let item = this.Get(id);
        return item ? item.abrevia || item.nombre : "";

    }

}

class Errors {

    static INVALID_TOKEN = 1000;

    static FORM_VALIDATION = 2000;

    static ErrorObject(err) {
        if (Utils.IsObject(err)) {
            if (err.responseJSON != undefined) {
                return err.responseJSON;
            }
            if (err.responseText != undefined) {
                return {
                    message: err.responseText
                }
            }
            if (err.message == undefined) {
                return Utils.Merge(err, {
                    message: err.code == Errors.FORM_VALIDATION ? null : App.UNIDENTIFIED_ERROR_MESSAGE
                })
            }
            return { internal: true, message: err.message, stack: err.stack }
        } else {
            if (Utils.IsString(err)) {
                return { message: err }
            }
            return { internal: true, message: App.UNIDENTIFIED_ERROR_MESSAGE }
        }
    }

    static Handle(err) {
        if (err instanceof TypeError) {
            return App.ShowMessage([{ message: "Ha ocurrido un error inesperado:", detail: err.message }, { message: "Detalle:", detail: err.stack }])
        } else
        if (err.code == Exceptions.INVALID_TOKEN) {
            this.HandleInvalidToken()
        } else if (err.side == Exceptions.SERVER_SIDE && err.type == Exceptions.TYPE_INTERNAL) {
            this.HandleInternalServer(err)
        } else if (err.code == Exceptions.FORM_VALIDATION) {

        } else {
            return App.ShowError({ message: err.message || App.UNIDENTIFIED_ERROR_MESSAGE }).then(closeData => {
                console.log(err.stack)
            })
        }
    }

    static HandleInvalidToken() {
        App.ShowMessage(
            [{
                message: "La sesión del Usuario",
                detail: App.UserNombreApellido(),
                skipSection: 2
            }, {
                message: "ha terminado por tiempo",
                quotes: false,
                detail: "Para continuar operando Ud. debe reingresar al Sistema"
            }]
        ).then(closeData =>
            App.Login())
    }

    static HandleInternalServer(err) {
        return App.ShowError({
            message: Messages.Build([{
                message: "Ha ocurrido un Error en el Servidor:",
                detail: err.message
            }, {
                message: "datos del error:",
                detail: err.detail
            }])
        })
    }

}

class Exceptions {

    // Server Side

    static SERVER_SIDE = "server";

    static TYPE_AUTHENTICATION = "authentication"
    static TYPE_VALIDATION = "validation";
    static TYPE_INTERNAL = "internal";

    static INVALID_TOKEN = "invalidToken";
    static DUPLICATED_ENTITY = "duplicatedEntity";
    static DATABASE = "database";
    static REQUIRED_VALUE = "requiredValues"
    static SQL_PARAMETER_VALUE_NOT_FOUND = "sqlParameterValueNotFound"
    static TENANT_NOT_DEFINED = "Tenant no definido"
    static ID_NOT_DEFINED = "idNotDefined"
    static SQL_WHERE_NOT_DEFINED = "sqlWhereNotDefined"
    static USER_NOT_EXISTS = "userNotExists"
    static USER_EMAIL_NOT_FOUND = "userEmailNotFound"
    static USER_INVALID_PASSWORD = "userInvalidPassword"
    static FOREIGN_KEY_REFERENCE_NOT_DEFINED = "foreignKeyReferenceNotDefined"
    static NOT_IMPLEMENTED = "notImplemented"
    static APELLIDO_NOMBRE_DUPLICATED = "apellidoNombreDuplicated"
    static EMAIL_DUPLICATED = "emailDuplicated"
    static NOTA_OUT_OF_RANGE = "notaOutOfRange"

    static FECHA_DESDE_DEBE_SER_MENOR_FECHA_HASTA = "fechaDesdeDebeSerMenorFechaHasta"
    static FECHA_DESDE_DEBE_ESTAR_EN_AÑO_LECTIVO = "fechaDesdeDebeEstarEnAñoLectivo"
    static FECHA_HASTA_DEBE_ESTAR_EN_AÑO_LECTIVO = "fechaHastaDebeEstarEnAñoLectivo"
    static PERIODO_INTERSECTA_OTRO_PERIODO = "periodoIntersectaOtroPeriodo"
    static PERIODO_CONTIENE_OTRO_PERIODO = "periodoContieneOtroPeriodo"
    static FECHA_ENTREGA_DEBER_SER_MAYOR_IGUAL_INICIO = "fechaEntregaDebeSerMayorIgualInicio"
    static DEBE_ESTAR_DENTRO_PERIODO = "debeEstarDentroPeriodo"

    static NOTA_DESDE_DEBE_SER_MENOR_IGUAL_NOTA_HASTA = "notaDesdeDebeSerMenorIgualNotaHasta"
    static RANGO_NOTAS_INTERSECTA_OTRO_RANGO = "rangoNotasIntersectaOtroRango"
    static RANGO_NOTAS_CONTIENE_OTRO_RANGO = "rangoNotasContieneOtroRango"
    static SIGLA_DUPLICATED = "siglaDuplicated"

    // Client Side 

    static CLIENT_SIDE = "client";

    static FORM_VALIDATION = "formValidation"
    static MAIL_INGRESADO_NO_COINCIDE_CON_REPETICION = "mailIngresadoNoCoincideConRepeticion";
    static PASSWORD_INGRESADO_TIENE_MENOS_8_CARACTERES = "mailIngresadoTieneMenos8Caracteres";
    static PASSWORD_INGRESADO_NO_COINCIDE_CON_REPETICION = "passwordIngresadoNoCoincideConRepeticion"

    static Validation(p) {
        return Utils.Merge({
            side: "client",
            type: this.TYPE_VALIDATION,
        }, p)
    }

    static FormValidation() {
        return this.Validation({ code: this.FORM_VALIDATION })
    }

}

class Generos extends LocalMemoryTable {

    static DefineData() {
        return [{
                id: "M",
                nombre: "Masculino"
            },
            {
                id: "F",
                nombre: "Femenino"
            },
            {
                id: "O",
                nombre: "Otro"
            }
        ]
    }

}

class Hours {

    static FormatShort(date) {
        return $.format.date(date, "hh:mm");
    }
}

class Messages {

    static EMAIL_INGRESADO_NO_CORRESPONDE = "El email ingresado no corresponde a ningún Usuario previamente<br>registrado."
    static POR_FAVOR_REGISTRESE = "Si Usted desea registrarse, presione 'ME QUIERO REGISTRAR'";
    static COMBINACION_EMAIL_PASSWORD_INCORRECTA = "La combinación de Email y Password, no es correcta."
    static POR_FAVOR_VERIFIQUE = "Por favor verifique sus datos.";
    static POR_FAVOR_VERIFIQUE_Y_VUELVA = "Por favor verifique sus datos y vuelva a ingresarlos.";

    static Build(p) {
        let message = "";
        Utils.ToArray(p).forEach(section => message += this.BuildSection(section));
        return message;
    }

    static BuildSection(p) {
        let section;
        if (p != undefined) {
            section = "<br><b>" + p.message + this.Detail(p) + Html.LineFeed(Utils.IfNotDefined(p.skipSection, 1))
        } else {
            section = "";
        }
        return section;
    }

    static Detail(p) {

        function text(d) {
            return (d != undefined ? Html.Tab(Utils.IfNotDefined(p.tab, 2)) +
                Strings.SingleQuotes(d, p.quotes) : "");
        }

        let detail = "";

        Utils.ToArray(p.detail).forEach(d =>
            detail += (detail != "" ? "<br>" : "") + text(d));

        return Html.LineFeed(Utils.IfNotDefined(p.lineFeed, 2)) + detail;

    }

    static PorFavorVerifique(lineFeed = 0) {
        return Html.LineFeed(lineFeed) + this.POR_FAVOR_VERIFIQUE
    }


}

class NotasData {

    refresh(materiaCurso) {
        if (Utils.IsDefined(materiaCurso)) {
            return new Rest({ path: "notas_data" })
                .promise({
                    verb: "list",
                    data: {
                        materiacurso: materiaCurso
                    }
                })
                .then(data =>
                    this.setData(data))
                .then(() =>
                    this.setExamenesData())
                .then(() =>
                    this.setPeriodosData())
        } else {
            this.setData(this.emptyData());
            return Promise.resolve()
        }
    }

    setData(data) {
        this.valoracionesRows = data.valoracionesRows;
        this.periodosRows = data.periodosRows;
        this.alumnosRows = data.alumnosRows;
        this.notasRows = data.notasRows;
        this.examenesRows = data.examenesRows;
    }

    emptyData() {
        return {
            valoracionesRows: [],
            periodosRows: [],
            alumnosRows: [],
            examenesRows: [],
            notasRows: []
        }
    }

    setExamenesData() {
        for (const row of this.examenesRows) {
            row.desde = new Date(row.desde);
            row.hasta = new Date(row.hasta);
            row.temporalidad = Dates.Temporalidad(row.desde, row.hasta)
        }
    }

    setPeriodosData() {
        for (const row of this.periodosRows) {
            row.examenesCantidad = this.examenesCantidadPorPeriodo(row.id);
            row.desde = new Date(row.desde);
            row.hasta = new Date(row.hasta);
            row.temporalidad = Dates.Temporalidad(row.desde, row.hasta)
        }
    }

    examenesCantidadPorPeriodo(periodo) {
        let cantidad = 0
        for (const row of this.examenesRows) {
            if (row.periodo == periodo) {
                ++cantidad;
            }
        }
        return cantidad;
    }

    hasLastPeriodo() {
        return 0 < this.periodosRows.length
    }

    getLastPeriodo() {
        if (this.hasLastPeriodo()) {
            return this.periodosRows[this.periodosRows.length - 1];
        }
    }

    alumnoPromedios(alumno) {
        const promedios = {};
        for (const row of this.periodosRows) {
            const promedio = this.alumnoPromedioPeriodo(alumno, row.id);
            promedios["periodo_" + row.id] = promedio;
        }
        return promedios;
    }

    alumnoPromedioPeriodo(alumno, periodo) {
        let suma = 0;
        let cantidad = 0;
        for (const row of this.notasRows) {
            if (row.alumno == alumno && row.periodo == periodo && Utils.IsDefined(row.nota)) {
                suma += row.nota;
                ++cantidad;
            }
        }
        const promedio = 0 < cantidad ? Math.round(suma / cantidad) : undefined;
        const valoracion = this.valoracion(promedio);
        return {
            promedio: promedio,
            valoracion: valoracion,
            status: this.alumnoStatus(periodo, cantidad)
        }
    }

    alumnoPromedioAnual(alumno) {
        return this.promedioTotal(this.alumnoPromedios(alumno))
    }

    promedioTotal(promedios) {
        let suma = 0;
        let cantidad = 0;
        Object.keys(promedios).forEach((key, i) => {
            const promedio = promedios[key].promedio;
            if (promedio != undefined) {
                suma += promedios[key].promedio;
                cantidad += 1;
            }
        })
        const promedioTotal = 0 < cantidad ? Math.round(suma / cantidad) : undefined;
        const valoracionTotal = this.valoracion(promedioTotal);
        return { total: { promedio: promedioTotal, valoracion: valoracionTotal } };
    }

    valoracion(promedio) {
        if (promedio != undefined) {
            for (const row of this.valoracionesRows) {
                if (row.desde <= promedio && promedio <= row.hasta) {
                    return row.sigla
                }
            }
        }
    }

    alumnoStatus(periodo, cantidad) {
        if (this.examenesRows.length == 0) {
            return "No hay exámenes cargados"
        }
        const periodoRow = this.getPeriodoRow(periodo);
        const examenesCantidad = periodoRow.examenesCantidad;
        if (cantidad == 0) {
            return "No hay notas cargadas"
        }
        if (cantidad < examenesCantidad) {
            const diferencia = (examenesCantidad - cantidad);
            if (1 < diferencia) {
                return "Faltan cargar " + (examenesCantidad - cantidad) + " notas";
            } else {
                return "Falta cargar " + diferencia + " nota";
            }
        }
        return "Completo"
    }

    getPeriodoPresenteRow() {
        for (const row of this.periodosRows) {
            if (row.temporalidad = Dates.PRESENTE) {
                return row;
            }
        }
    }

    getNota(examen, alumno) {
        const row = this.getNotasRow(examen, alumno);
        if (row != undefined) {
            return row.nota
        }
    }

    saveNota(examen, alumno, nota) {
        const row = this.getNotasRow(examen, alumno);
        if (row != undefined) {
            if (Utils.IsDefined(nota)) {
                row.nota = nota
            } else {
                this.notasRows = this.notasRows.filter(row =>
                    !(row.examen == examen && row.alumno == alumno))
            }
        } else {
            if (Utils.IsDefined(nota)) {
                this.notasRows.push({
                    examen: examen,
                    alumno: alumno,
                    nota: nota,
                    periodo: this.getExamenRow(examen).periodo
                })
            }
        }
        return Promise.resolve()
    }

    getAlumnoRow(id) {
        for (const row of this.alumnosRows) {
            if (row.id == id) {
                return row;
            }
        }
    }

    getPeriodoRow(id) {
        for (const row of this.periodosRows) {
            if (row.id == id) {
                return row;
            }
        }
    }

    getPeriodoRowByName(nombre) {
        for (const row of this.periodosRows) {
            if (Strings.EqualsIgnoreCase(row.nombre, nombre)) {
                return row;
            }
        }
    }

    getExamenRow(id) {
        for (const row of this.examenesRows) {
            if (row.id == id) {
                return row;
            }
        }
    }

    getNotasRow(examen, alumno) {
        for (const row of this.notasRows) {
            if (row.examen == examen && row.alumno == alumno) {
                return row
            }
        }
    }

    hayNotas() {
        return 0 < this.notasRows.length;
    }

    hayNotasAlumno(alumno) {
        for (const row of this.notasRows) {
            if (row.alumno == alumno && Utils.IsDefined(row.nota)) {
                return true;
            }
        }
        return false
    }

}

class ObjectBase {

    constructor(parameters = {}) {
        this._parameters = parameters;
    }

    parameters() {
        return this._parameters;
    }

    configuration() {
        if (this._configuration == undefined) {
            this._configuration = this.defineConfiguration();
        }
        return this._configuration;
    }

    defineConfiguration() {
        return Utils.Merge(this.defaultConfiguration(), this.extraConfiguration(), this.parameters());
    }

    defaultConfiguration() {}

    extraConfiguration() {}

    class() {
        return this.constructor;
    }

    className() {
        return this.class().name;
    }

    static Class() {
        return this.prototype.constructor;
    }

    static ClassName() {
        return this.Class().name;
    }

    static Instance() {
        if (this._Instance == undefined) {
            this._Instance = new(this.Class())();
        }
        return this._Instance;
    }

}

class Template extends ObjectBase {

    element() {
        if (this._element == undefined) {
            this._element = this.defineElement();
        }
        return this._element;
    }

    defineElement() {
        const configuration = this.configuration();
        const element = $(configuration.tag || "<div>");
        element.attr("id", configuration.id);
        element.addClass(configuration.name);
        element.css(this.styles());
        element.text(configuration.text)
        this.addItemsElements(element);
        return element;
    }

    styles() {
        if (this._styles == undefined) {
            this._styles = this.defineStyles();
        }
        return this._styles;
    }

    defineStyles() {
        const configuration = this.configuration();
        const styles = {};
        Object.keys(configuration).forEach(
            key => {
                const functionName = "_" + key;
                if (this[functionName] != undefined && typeof this[functionName] == "function") {
                    Object.assign(styles, this[functionName](configuration[key]));
                }
            }
        )
        return styles;
    }

    items() {
        if (this._items == undefined) {
            this._items = this.defineItems();
        }
        return this._items;
    }

    defineItems() {
        const configuration = this.configuration()
        const items = [];
        if (configuration.items != undefined) {
            configuration.items.forEach(
                item => {
                    if (!(item instanceof Template)) {
                        item = new Template(item)
                    }
                    items.push(item)
                }
            )
        }
        return items;
    }

    addItemsElements(element) {
        this.items().forEach(
            item => element.append(item.element())
        )
    }

    findElementByClass(className) {
        if (this.element().hasClass(className)) {
            return this.element()
        } else {
            return this.element().find("." + className);
        }
    }

    setElementStyleByClass(className, css) {
        const element = this.findElementByClass(className);
        if (element != undefined) {
            element.css(css);
        }
    }

    hideElementByClass(className) {
        this.setElementStyleByClass(className, { display: "none" })
    }

    toggleByClassName(className) {
        const element = this.findElementByClass(className);
        Html.ToggleVisibility(element);
    }

    html() {
        return this.element()[0].outerHTML;
    }

    appendTo(element) {
        if (element != "body") {
            element.empty();
        }
        this.element().appendTo(element);
    }

    _fillContainer(fillContainer) {
        if (fillContainer == true) {
            return {
                "flex": 1
            }
        }
    }

    _margin(margin) {
        return {
            "margin": margin
        }
    }

    _marginTop(margin) {
        return { "margin-top": margin }
    }

    _marginLeft(margin) {
        return { "margin-left": margin }
    }

    _marginBottom(margin) {
        return { "margin-bottom": margin }
    }

    _marginRight(margin) {
        return { "margin-right": margin }
    }

    _padding(padding) {
        return {
            "padding": padding
        }
    }

    _paddingLeft(padding) {
        return {
            "padding-left": padding
        }
    }

    _paddingRight(padding) {
        return {
            "padding-right": padding
        }
    }

    _paddingBottom(padding) {
        return {
            "padding-bottom": padding
        }
    }

    _height(height) {
        return {
            "height": height
        }
    }

    _width(width) {
        return {
            "width": width
        }
    }

    _orientation(orientation) {
        if (Strings.EqualsIgnoreCase(orientation, "vertical")) {
            return {
                "display": "flex",
                "flex-direction": "column"
            }
        } else if (Strings.EqualsIgnoreCase(orientation, "horizontal")) {
            return {
                "display": "flex",
                "flex-direction": "row"
            }
        }
    }

    _backgroundColor(color) {
        return {
            "background-color": color
        }
    }

    _visible(visible) {
        if (visible == false) {
            return { display: "none" }
        } else if (visible == true) {
            return { visible: "block" }
        }
    }

    _borderRight(attributes) {
        return {
            "border-right": attributes
        }
    }

    _fontSize(fontSize) {
        return {
            "font-size": fontSize
        }
    }

}

class Utils {

    static IsDefined(x) {
        return x != undefined && x != null;
    }

    static IsNotDefined(x) {
        return !this.IsDefined(x);
    }

    static IfDefined(x1, x2) {
        if (this.IsDefined(x1)) {
            return x2;
        }
    }

    static IfNotDefined(x1, x2) {
        if (this.IsDefined(x1)) {
            return x1;
        } else {
            return x2;
        }
    }

    static IsString(x) {
        return (typeof x === "string");
    }

    static IsObject(x) {
        return (x instanceof Object && !(x instanceof Date))
    }

    static IsFunction(x) {
        return (typeof x === "function");
    }

    static IsArray(x) {
        return Array.isArray(x);
    }

    static Merge(...parameters) {
        return $.extend(true, {}, ...parameters);
    }

    static RandomInteger(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static Delay(miliseconds) {
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve(true), miliseconds)
        })
    }

    static Evaluate(x, ...parameters) {
        if (this.IsFunction(x)) {
            return x(...parameters);
        } else {
            return x;
        }
    }

    static ReduceObject(o, properties) {
        const r = {};
        properties.forEach(
            p => r[p] = o[p]
        )
        return r;
    }

    static EmptyPromise() {
        return new Promise((resolve, reject) => {
            resolve(true)
        })
    }

    static NormalizeData(data, dataFields) {
        const normalized = {}
        let keys = Object.keys(data);
        if (Utils.IsDefined(dataFields)) {
            if (!Utils.IsArray(dataFields)) {
                dataFields = dataFields.split(",");
            }
            keys = keys.filter(key => dataFields.includes(key))
        }
        keys.forEach(key => {
            let value = data[key];
            if (key == "id") {

            } else if (Utils.IsString(value)) {
                value = Strings.TrimOnSpace(value);
            } else if (Utils.IsObject(value)) {
                value = value.id
            }
            normalized[key] = value;
        })
        return normalized;
    }

    static ReduceId(x) {
        if (this.IsObject(x)) {
            return x.id;
        } else {
            return x;
        }
    }

    static Clone(object) {
        return Object.assign({}, object);
    }

    static IsEmptyObject(o) {
        return this.IsNotDefined(o) || Object.keys(o).length == 0;
    }

    static ToArray(x) {
        if (this.IsArray(x)) {
            return x;
        } else {
            return [x];
        }
    }

}

class Strings {

    static NewGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
            c => {
                var r = Math.random() * 16 | 0,
                    v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            }
        );
    }

    static Capitalize(s) {
        return s.charAt(0).toUpperCase() + s.substr(1).toLowerCase();
    }

    static Concatenate(array, separator = " ") {
        return Arrays.NoNulls(array).join(separator);
    }

    static EqualsIgnoreCase(s1, s2) {
        return (s1.toLowerCase() == s2.toLowerCase());
    }

    static Occurences(s1, s2) {
        return s1.split(s2).length - 1;
    }

    static SingleQuotes(s, withQuotes = true) {
        if (Utils.IsDefined(s)) {
            if (withQuotes) {
                return "'" + s + "'";
            } else {
                return s;
            }
        } else {
            return "";
        }
    }

    /*    
        static StringIs(string, strings) {

            for (const s of this.ToArray(strings)) {
                if (this.EqualsIgnoreCase(string, s)) {
                    return true;
                }
            }
            return false;
        }
    */

    static ToArray(s) {
        if (Utils.IsArray(s)) {
            return s
        } else {
            return s.split(",");
        }
    }

    static Replace(s1, s2, s3) {
        return s1.replace(s2, s3);
    }

    static RemoveChars(s, chars) {
        chars.forEach(c => {
            s = s.replace(c, "");
        })
        return s;
    }

    static SubstringAfter(s, after) {
        let a = s.split(after);
        if (1 < a.length) {
            return a[1].split(" ")[1];
        } else {
            return "";
        }
    }

    static RemoveLastChar(s) {
        return str.substring(0, s.length - 1);
    }

    static Contains(s1, s2) {
        return s1.includes(s2);
    }

    static ZeroesLeft(n, z) {
        return n.toString().padStart(z, '0');
    }

    static OneSpace(s) {
        return s.replace(/\s\s+/g, ' ');
    }

    static TrimOnSpace(s) {
        return this.OneSpace(s).trim();
    }

}

class Dates {

    static PASADO = 1;
    static PRESENTE = 2;
    static FUTURO = 3;

    static New(date) {
        if (date) {
            return new Date(date);
        } else {
            return new Date();
        }
    }

    static Today() {
        return new Date();
    }

    static ThisYear() {
        return new Date().getFullYear();
    }

    static AddDays(date, days) {
        const newDate = Dates.New(date)
        return new Date(newDate.setDate(newDate.getDate() + days));
    }

    static SetTime(date, time) {
        const a = time.split(":")
        const hour = parseInt(a[0]);
        const minutes = parseInt(a[1]);
        const seconds = parseInt(a[2]);
        return new Date(date.setHours(hour, minutes, seconds));
    }

    static TodayPlusDays(days) {
        return this.AddDays(this.Today(), days);
    }

    static Format(date, quotes = false) {
        let format = $.format.date(date, "dd MMM yyyy");
        if (quotes == true) {
            format = Strings.SingleQuotes(format)
        }
        return format;
    }

    static Between(d1, d2, d3) {
        return d2 <= d1 && d1 <= d3;
    }

    static ToDate(s) {
        return new Date(s);
    }

    static TimeAsString(d) {
        return Strings.ZeroesLeft(d.getHours(), 2) + ":" + Strings.ZeroesLeft(d.getMinutes(), 2) + ":" + Strings.ZeroesLeft(d.getSeconds(), 2);
    }

    static DateFromHour(h) {
        return new Date(App.BASE_DATE + " " + h);
    }

    static DateFromDayOfWeek(date, day) {
        const firstDayOfWeek = this.FirstDayOfWeek(date);
        const dateFromDay = this.AddDays(firstDayOfWeek, day - 1);
        return dateFromDay;
    }

    static FirstDayOfWeek(date) {
        const newDate = Dates.New(date);
        const day = newDate.getDay() || 7;
        if (day != 1) {
            newDate.setHours(-24 * (day - 1));
        }
        return newDate;
    }

    static Temporalidad(desde, hasta) {
        if (hasta < Dates.Today()) {
            return Dates.PASADO;
        }
        if (Dates.Between(Dates.Today(), desde, hasta)) {
            return Dates.PRESENTE;
        }
        if (Dates.Today() < desde) {
            return Dates.FUTURO;
        }
    }

    static DesdeHasta(desde, hasta) {
        return Dates.Format(desde) + " - " + Dates.Format(hasta)
    }

}

class Arrays {

    static NoNulls(array) {
        return array.filter(
            e => e != undefined && e != null
        )
    }

    static ToDate(array, names) {
        array.forEach(e =>
            names.forEach(n =>
                e[n] = Dates.ToDate(e[n])
            )
        )
    }

}

class Html {

    static IsVisible(element) {
        return element.css("display") != "none";
    }

    static ToggleVisibility(element, cssVisible = "flex") {
        const isVisible = element.css("display") != "none";
        element.css("display", isVisible ? "none" : cssVisible);
        return !isVisible;
    }

    static Hide(element) {
        element.css("display", "none");
    }

    static Lines(lines) {
        let text = "";
        lines.forEach(
            (line, i) => text += (0 < i ? "<br>" : "") + (Utils.IsDefined(line) ? line : "")
        )
        return text;
    }

    static UnderlineTitle(title, plus = 7) {
        return title + "<br>" + "-".repeat(title.length + plus);
    }

    static LineFeed(n = 1) {
        if (0 < n) {
            return "<br>".repeat(n);
        } else {
            return ""
        }
    }

    static Tab(n) {
        if (0 < n) {
            return "&emsp;".repeat(n);
        } else {
            return "";
        }
    }

    static Bold() {
        return "<b>";
    }

    static BoldWithStyle(style) {
        return '<b style="' + style + '">';
    }

    static Italic() {
        return "<i>";
    }

}

class DialogView extends View {

    defaultConfiguration() {
        return Utils.Merge(super.defaultConfiguration(), {
            mode: "popup",
            popup: this.popupConfiguration(),
            components: {
                toolbar: {
                    items: this.toolbarItems()
                }
            }
        })
    }

    defineTemplate() {
        return new DialogViewTemplate();
    }

    popupConfiguration() {}

    toolbar() {
        return this.components().toolbar;
    }

    toolbarItems() {
        return [this.itemOkey(), this.itemCancel()]
    }

    itemOkey() {
        return ToolbarItem.Okey({ onClick: e => this.okey() })
    }

    itemCancel() {
        return ToolbarItem.Cancel({ onClick: e => this.cancel() })
    }

    okey() {
        this.close(this.closeDataOkey())
    }

    cancel() {
        this.close(this.closeDataCancel());
    }

    closeDataOkey() {
        return { okey: true };
    }

    closeDataCancel() {
        return { okey: false };
    }

    originalTitle() {
        return Utils.Evaluate(this.configuration().popup.title);
    }

}

class DialogViewTemplate extends Template {

    defaultParameters() {
        return Utils.Merge(super.defaultParameters(), {
            fillContainer: true,
            orientation: "vertical",
            items: [
                this.toolbar()
            ]
        })
    }

    toolbar() {
        return {
            name: "toolbar"
        }
    }

}

class EntryView extends DialogView {

    defaultConfiguration() {
        return Utils.Merge(super.defaultConfiguration(), {
            components: {
                form: {
                    items: this.formItems(),
                    onEditorEnterKey: e => this.onFormEditorEnterKey(e)
                }
            }
        })
    }

    defineTemplate() {
        return new EntryViewTemplate();
    }

    form() {
        return this.components().form;
    }

    formItems() {};

    getData() {
        return this.form().getData();
    }

    setData(data) {
        this.form().setData(data);
    }

    updateData(data) {
        this.form().updateData(data);
    }

    saveData() {
        this.form().saveData()
    }

    dataHasChanged() {
        return this.form().dataHasChanged()
    }

    getChangedData() {
        return this.form().getChangedData();
    }

    firstEditor() {}

    focus() {
        this.focusFirstEditor();
    }

    focusFirstEditor() {
        let firstEditor = this.firstEditor()
        if (firstEditor != undefined) {
            this.form().focusEditor(firstEditor);
        } else {
            this.form().focus();
        }
    }

    okey() {
        this.validate()
            .then(() =>
                super.okey())
            .catch(err => {
                this.handleError(err)
            })
    }

    validate() {
        return this.formValidate();
    }

    formValidate() {
        return this.form().validate();
    }

    closeDataOkey() {
        return { okey: true, dataHasChanged: this.dataHasChanged() }
    }

    rest() {
        if (this._rest == undefined) {
            this._rest = this.defineRest()
        }
        return this._rest;
    }

    defineRest() {
        return new Rest({ path: this.path() })
    }

    path() {
        throw new NotImplementedException({ message: "not implemented method: path()" })
    }

    transformData(data) {
        return data;
    }

    onFormEditorEnterKey(e) {
        this.okey();
    }

    validationError(message) {
        return { isValidation: true, message: message }
    }

    setEditorValue(dataField, value) {
        this.form().setEditorValue(dataField, value);
    }

    setEditorProperty(dataField, propertyName, value) {
        this.form().setEditorProperty(dataField, propertyName, value);
    }

    blankEditorValue(dataField) {
        this.form().blankEditorValue(dataField);
    }

    getEditorValue(dataField) {
        return this.form().getEditorValue(dataField);
    }

    getDate(dataField) {
        return this.form().getDate(dataField);
    }

    getValue(dataField) {
        return this.form().getValue(dataField);
    }

    getSingleQuotes(dataField) {
        return this.form().getSingleQuotes(dataField)
    }

    getEditorText(dataField) {
        return this.form().getEditorText(dataField);
    }

}

class EntryViewTemplate extends Template {

    extraConfiguration() {
        return {
            fillContainer: true,
            orientation: "vertical",
            items: [
                this.form(),
                this.toolbar()
            ]
        }
    }

    form() {
        return {
            name: "form",
            margin: 10,
            fillContainer: true,
            orientation: "vertical"
        }
    }

    toolbar() {
        return {
            name: "toolbar"
        }
    }

}

class ErrorView extends MessageView {

    isInternal() {
        return this.parameters().internal == true;
    }

    popupTitleDefault() {
        return this.isInternal() ? App.INTERNAL_ERROR_MESSAGE_TITLE : App.VALIDATION_MESSAGE_TITLE;
    }

    defineMessage() {
        return (this.isInternal() ? '<style="background-color: lightgrey"><i>' : "<b>") +
            this.parameters().message +
            (this.parameters().stack != undefined ? Html.LineFeed(3) + this.parameters().stack : "");
    }

}

class ExportExcelDialog extends EntryView {

    popupConfiguration() {
        return {
            title: "Exporta a Excel",
            width: this.parameters().width || 550,
            height: 200
        }
    }

    formItems() {
        return [
            Item.Text({
                dataField: "nombre",
                label: "Nombre del archivo a exportar",
                value: this.parameters().fileName,
                required: true
            })
        ]
    }

}

class FilterView extends ListView {

    defaultConfiguration() {
        return Utils.Merge(super.defaultConfiguration(), {
            components: {
                filter: {
                    visible: true,
                    labelLocation: "top",
                    items: this.filterItems(),
                },
            },
        })
    }

    filterItems() {}

    filter() {
        return this.components().filter;
    }

    getFilterText(dataField) {
        if (this.filter().isReady()) {
            return this.filter().getEditorText(dataField);
        }
    }

    getFilterValue(dataField) {
        if (this.filter().isReady()) {
            return this.filter().getEditorValue(dataField);
        }
    }

    setFilterValue(dataField, value) {
        this.filter().setEditorValue(dataField, value);
    }

    refreshFilterValue(dataField, value) {
        this.filter().refreshEditorValue(dataField, value);
    }

}

class FilterViewTemplate extends Template {

    extraConfiguration() {
        return {
            fillContainer: true,
            orientation: "vertical",
            items: [{
                    name: "label",
                    marginBottom: App.LABEL_BOTTOM_MARGIN
                }, {
                    name: "filter",
                    orientation: "vertical",
                    backgroundColor: App.BOX_BACKGROUND_COLOR,
                    padding: 10,
                }, {
                    name: "toolbar",
                    backgroundColor: App.BOX_BACKGROUND_COLOR,
                }, {
                    name: "list",
                    fillContainer: true,
                    orientation: "vertical",
                    height: 0
                }, {
                    name: "contextMenu"
                }

            ]
        }
    }

}

class FormView extends EntryView {

    path() {
        return this.listView().path()
    }

    transformData(data, verb) {
        return Utils.NormalizeData(data);
    }

    defaultConfiguration() {
        return Utils.Merge(super.defaultConfiguration(), {
            sendAllData: true
        })
    }

    listView() {
        return this.parameters().listView;
    }

    async init() {
        this.refreshTitle();
        if (this.id() != undefined) {
            await this.get(this.id());
        }
        this.focus();
    }

    refreshTitle() {
        this.popup().setTitle(this.title())
    }

    title() {
        if (this.isInserting()) {
            return "Agrega " + this.originalTitle()
        } else {
            return "Modifica " + this.originalTitle()
        }
    }

    isInserting() {
        return this.id() == undefined;
    }

    id() {
        return this.getData().id;
    }

    get(id) {
        return this.rest().get({ id: id })
            .then(data =>
                this.afterGetData(data))
            .then(data =>
                this.updateData(data))
            .then(() =>
                this.saveData())
            .catch(err => {
                this.handleError(err)
            })
    }

    afterGetData(data) {
        return data;
    }

    okey() {
        this.validate()
            .then(() => {
                if (this.mustSave()) {
                    if (this.isInserting()) {
                        return this.saveInsert()
                    } else {
                        return this.saveUpdate()
                    }
                } else {
                    this.close(this.closeDataNotSaved());
                }
            })
            .catch(err =>
                this.handleError(err)
            )
    }

    mustSave() {
        return this.isInserting() || this.dataHasChanged();
    }

    saveInsert() {
        return this.rest().insert(this.dataToInsert(), "insert")
            .then(data => {
                this.close(this.closeDataSaveInsert(data.id));
            });
    }

    saveUpdate() {
        return this.rest().update(this.dataToUpdate(), "update")
            .then(data =>
                this.close(this.closeDataSaveUpdate())
            );
    }

    dataToInsert() {
        const data = this.getData();
        return this.transformData(data, "insert")
    }

    dataToUpdate() {
        let data;
        if (this.configuration().sendAllData == true) {
            data = this.getData();
        } else {
            data = Utils.Merge(this.getChangedData(), { id: this.id() });
        }
        return this.transformData(data, "update")
    }

    closeDataSaveInsert(id) {
        return {
            okey: true,
            operation: this.operation(),
            id: id,
            dataHasChanged: true,
        };
    }

    closeDataSaveUpdate() {
        const dataHasChanged = this.dataHasChanged();
        return {
            okey: true,
            operation: this.operation(),
            id: this.id(),
            dataHasChanged: dataHasChanged,
        }
    }

    closeDataNotSaved() {
        return {
            okey: true,
            operation: this.operation(),
            id: this.id(),
            dataHasChanged: false,
        }
    }

    close(closeData) {
        if (closeData.dataHasChanged == true && this.listView() != undefined) {
            this.listView().refresh(closeData.id);
        }
        super.close(closeData);
    }

    popupOnShown(e) {
        this.init();
    }

    operation() {
        if (this.isInserting()) {
            return "insert";
        } else {
            return "update";
        }
    }

    handleError(err) {
        if (err.code == Exceptions.REQUIRED_VALUE) {
            App.ShowMessage({ message: "Ha ocurrido un error en el Servidor:", detail: "Campo requerido " + Strings.SingleQuotes(err.message), quotes: false })
        } else
        if (err.code == Exceptions.DUPLICATED_ENTITY) {
            App.ShowError({ message: this.duplicatedMessage() })
        } else {
            super.handleError(err)
        }
    }

    duplicatedMessage() {
        return "Registro duplicado"
    }

}

class ListView extends View {

    constructor(parameters) {
        super(parameters);
    }

    defaultConfiguration() {
        return Utils.Merge(super.defaultConfiguration(), {
            components: {
                label: {
                    text: this.labelText()
                },
                filter: {
                    visible: false,
                },
                toolbar: {},
                list: {
                    dataSource: this.class().DataSource(),
                    columns: this.listColumns(),
                    toolbar: {
                        items: ["groupPanel", this.itemExportExcel(), "searchPanel"]
                    },
                    errorRowEnabled: false,
                    groupPanel: {
                        visible: true
                    },
                    onContentReady: e => this.listOnContentReady(e),
                    onRowDblClick: e => this.listOnRowDblClick(e),
                    onKeyDown: e => this.listOnKeyDown(e),
                    onDataErrorOccurred: e => this.listOnDataErrorOccurred(e),
                    onDisposing: e => this.listOnDisposing(e)
                },
                contextMenu: {
                    target: this.findElementByClass("list")
                }
            },
            editable: true,
            operations: ["insert", "edit", "delete", "export"],
            excelFileName: this.className()
        })
    }

    defineTemplate() {
        return new ListViewTemplate();
    }

    labelText() {}

    path() {
        return this.class().Path();
    }

    listColumns() {}

    allow(operation) {
        if (!this.configuration().operations.includes(operation)) {
            return false;
        }
        if (["insert", "edit"].includes(operation) && this.formViewClass() == undefined) {
            return false;
        }
        if (["edit", "delete", "export"].includes(operation) && !this.list().hasRows()) {
            return false;
        }
        if (["edit", "delete"].includes(operation) && !this.isFocusedRowData()) {
            return false;
        }
        return true;
    }

    insert() {
        if (this.allow("insert")) {
            this.formViewRender(this.formViewDefaultValues("insert"));
        }
    }

    edit() {
        if (this.allow("edit")) {
            this.formViewRender(Utils.Merge(this.formViewDefaultValues("edit"), { id: this.id() }));
        }
    }

    formViewRender(formData) {
        this.formView(formData).render().then(closeData => {
            if (closeData != undefined) {
                this.dataHasChanged = closeData.dataHasChanged;
            }
        })
    }

    formView(formData) {
        return new(this.formViewClass())({
            listView: this,
            components: {
                form: {
                    formData: formData
                }
            }
        });
    }

    formViewClass() {}

    formViewDefaultValues(mode) {}

    delete() {
        if (this.allow("delete")) {
            App.YesNo({ message: this.deleteMessage() }).then(
                closeData => {
                    if (closeData.okey) {
                        this.deleteRow(this.id());
                    }
                }
            )
        }
    }

    deleteMessage() {
        return Html.Bold() + "Borra este Registro";
    }

    deleteRow(id) {
        this.list().deleteRow({
                path: this.path(),
                id: id
            }).then(() =>
                this.dataHasChanged = true)
            .catch(err =>
                this.deleteErrorMessage(err));
    }

    deleteErrorMessage(err) {
        App.ShowMessage([{
            message: "No es posible borrar este registro",
            detail: this.rowDescription(),
        }, {
            message: "Debido a que hay registros vinculados con la Tabla",
            detail: this.relatedTableName(err)
        }])
    }

    rowDescription() {
        return this.focusedRowValue("nombre");
    }

    relatedTableName(err) {
        let tableName = Strings.RemoveChars(Strings.SubstringAfter(err.message, "en la tabla"), ["«", "»"]);
        return tableName != undefined ? App.TranslateTableName(tableName) : "";
    }

    rowType() {
        const row = this.list().focusedRow();
        if (row != undefined) {
            return row.rowType
        }
    }

    isFocusedRowGroup() {
        return this.rowType() == "group";
    }

    isFocusedRowData() {
        return this.rowType() == "data";
    }

    focusedRowValue(dataField) {
        return this.list().focusedRowValue(dataField);
    }

    focusedRowData() {
        return this.list().focusedRowData();
    }

    focusedRowValue(dataField) {
        return this.list().focusedRowValue(dataField);
    }

    label() {
        return this.components().label;
    }

    toolbar() {
        return this.components().toolbar;
    }

    list() {
        return this.components().list;
    }

    contextMenu() {
        return this.components().contextMenu;
    }

    id() {
        return this.list().id();
    }

    refresh(id) {
        this.list().refresh(id);
    }

    refreshToolbar() {
        this.toolbar().setItems(this.toolbarItems());
    }

    toolbarItems() {
        return [this.itemInsert()]
    }

    itemInsert() {
        return {
            widget: "dxButton",
            location: "before",
            options: {
                icon: "add",
                hint: "Agrega",
                onClick: e => this.insert()
            }
        }
    }

    itemExportExcel() {
        //        if (this.allow("export")) {
        return {
            widget: "dxButton",
            location: "after",
            options: {
                icon: "exportxlsx",
                hint: "Exporta a Excel",
                onClick: e => this.exportExcelDialog(e)
            }
        }
        //        }
    }

    itemSearchPanel() {
        if (this.list().hasRows() || this.list().hasSearchText()) {
            return "searchPanel"
        }
    }

    refreshContextMenuItems() {
        if (this.contextMenu() != undefined && this.contextMenu().instance() != undefined) {
            this.contextMenu().setItems(this.contextMenuItems());
        }
    }

    contextMenuItems() {
        return [
            this.contextItemInsert(),
            this.contextItemEdit(),
            this.contextItemDelete(),
            this.contextItemCollapseAll(),
            this.contextItemExpandAll(),
        ]
    }

    contextItemCollapseAll() {
        if (this.list().hasGroupedColumns()) {
            return {
                text: "Colapsa todo",
                onClick: e => this.collapseAll()
            }
        }
    }

    contextItemExpandAll() {
        if (this.list().hasGroupedColumns()) {
            return {
                text: "Expande todo",
                onClick: e => this.expandAll()
            }
        }
    }

    collapseAll() {
        this.list().collapseAll();
    }

    expandAll() {
        this.list().expandAll();
    }

    contextItemInsert() {
        if (this.allow("insert")) {
            return {
                text: "Agrega",
                onClick: e => this.insert(),
            }
        }
    }

    contextItemEdit() {
        if (this.allow("edit")) {
            return {
                text: "Modifica",
                onClick: e => this.edit(),
            }
        }
    }

    contextItemDelete() {
        if (this.allow("delete")) {
            return {
                text: "Borra",
                onClick: e => this.delete(),
            }
        }
    }


    afterRender() {
        return super.afterRender().then(() => {
            if (this.isPopup()) {
                this.label().setVisible(false);
            } else {
                this.label().setText(this.labelText());
            }
        });
    }

    focus() {
        this.list().focus();
    }

    focusRowById(id) {
        this.list().focusRowById(id)
    }

    listOnContentReady(e) {
        this.focusFirstRow();
        this.refreshToolbar();
        this.refreshContextMenuItems()
    }

    focusFirstRow() {
        this.list().focusFirstRow();
    }

    listOnDisposing(e) {
        if (!this.isPopup()) {
            this.saveState();
        }
    }

    saveState() {
        if (this.dataErrorOcurred != true) {
            return super.saveState();
        } else {
            return Promise.resolve()
        }
    }

    setState() {
        super.setState();
        this.list()
            .setState(this.state.list || null)
            .focusFirstRow()
    }

    getState() {
        return Utils.Merge(super.getState(), { list: this.list().getState() })
    }

    listOnRowDblClick(e) {
        this.edit();
    }

    listOnKeyDown(e) {
        if (e.event.key == "Insert" && this.allow("insert")) {
            this.insert();
        } else
        if (e.event.key == "Enter" && this.allow("edit")) {
            this.edit()
        } else
        if (e.event.key == "Delete" && this.allow("delete")) {
            this.delete();
        }
    }

    listOnDataErrorOccurred(e) {
        this.dataErrorOcurred = true;
        this.list().instance().dispose();
        if (this.isPopup()) {
            this.close({ error: true })
        } else {
            App.BlankViewElement();
            App.SelectFirstItem();
        }
    }

    exportExcelDialog(e) {
        new ExportExcelDialog({ fileName: this.excelFileName(), width: this.exportExcelDialogWidth() }).render()
            .then(data => {
                if (data.okey) {
                    this.exportExcel(e, this.excelFileName())
                }
            })
    }

    exportExcelDialogWidth() {}

    excelFileName() {
        return Utils.Evaluate(this.configuration().excelFileName);
    }

    exportExcel(e, fileName) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(fileName);

        DevExpress.excelExporter.exportDataGrid({
            component: this.list().instance(),
            worksheet,
            autoFilterEnabled: true,
        }).then(() => {
            workbook.xlsx.writeBuffer().then((buffer) => {
                saveAs(new Blob([buffer], { type: 'application/octet-stream' }), fileName + '.xlsx');
            });
        });
        e.cancel = true;
    }

    masterView() {
        return this.parameters().masterView;
    }

    hasRows() {
        return this.list().hasRows()
    }

    closeDataDefault() {
        return { dataHasChanged: this.dataHasChanged, id: this.list().id() }
    }

    popupOnHiding(e) {
        this.saveState().then(() =>
            super.popupOnHiding(e)
        );
    }

    static DataSource() {
        if (this._DataSource == undefined) {
            this._DataSource = this.DefineDataSource();
        }
        return this._DataSource;
    }

    static DefineDataSource() {}

    static ClearDataSource() {
        this._DataSource = undefined;
    }

    static Path() {
        return this.ClassName().toLowerCase();
    }

    static Render() {
        this.Instance().render();
    }

}

class ListViewTemplate extends Template {

    extraConfiguration() {
        return {
            fillContainer: true,
            orientation: "vertical",
            items: [{
                    name: "label",
                    marginBottom: App.LABEL_BOTTOM_MARGIN
                }, {
                    orientation: "vertical",
                    backgroundColor: App.BOX_BACKGROUND_COLOR,
                    items: [{
                        name: "filter",
                        padding: App.BOX_PADDING,
                        paddingTop: 5,
                        orientation: "vertical"
                    }]
                },
                {
                    name: "toolbar",
                    backgroundColor: App.BOX_BACKGROUND_COLOR,
                }, {
                    name: "list",
                    fillContainer: true,
                    orientation: "vertical",
                    height: 1
                }, {
                    name: "contextMenu"
                }
            ]
        }
    }

}

class MessageView extends DialogView {

    static HEIGHT_DEFAULT = 150;
    static WIDTH_DEFAULT = 250;

    popupConfiguration() {
        return {
            title: this.parameters().title || this.popupTitleDefault(),
            showCloseButton: this.parameters().closeButton == true,
            onShowing: e => this.popupOnShowing(e)
        }
    }

    defineTemplate() {
        return new MessageViewTemplate();
    }

    popupTitleDefault() {
        return App.MESSAGE_TITLE;
    }

    toolbarItems() {
        return [
            this.itemOkey()
        ]
    }

    afterRender() {
        this.template().findElementByClass("message").append(this.message())
    }

    popupOnShowing(e) {
        this.popup().setProperties({ height: this.popupHeight(), width: this.popupWidth() })
    }

    popupHeight() {
        return this.parameters().height || this.calculatedHeight()
    }

    calculatedHeight() {
        return Math.min(600, this.message().length + 130);
    }

    popupWidth() {
        return this.parameters().width || this.calculatedWidth()
    }

    calculatedWidth() {
        return Math.min(600, MessageView.WIDTH_DEFAULT +
            this.message().length + 100);
    }

    message() {
        if (this._message == undefined) {
            this._message = this.defineMessage();
        }
        return this._message;
    }

    defineMessage() {
        return this.parameters().message;
    }

    saveState() {
        return Promise.resolve();
    }

}

class MessageViewTemplate extends Template {

    extraConfiguration() {
        return {
            fillContainer: true,
            orientation: "vertical",
            items: [
                this.message(),
                this.toolbar()
            ]
        }
    }

    message() {
        return {
            name: "message",
            fillContainer: true
        }
    }

    toolbar() {
        return {
            name: "toolbar"
        }
    }
}

class SimpleListView extends ListView {

    extraConfiguration() {
        return {
            components: {
                list: {
                    toolbar: {
                        items: [this.itemInsert(), this.itemExportExcel(), "searchPanel"]
                    }
                }
            }
        }
    }

    defineTemplate() {
        return new SimpleListViewTemplate();
    }

    refreshToolbar() {}

}

class SimpleListViewTemplate extends Template {

    extraConfiguration() {
        return {
            fillContainer: true,
            orientation: "vertical",
            items: [{
                    name: "label",
                    marginBottom: App.LABEL_BOTTOM_MARGIN
                }, {
                    orientation: "vertical",
                    backgroundColor: App.BOX_BACKGROUND_COLOR,
                    items: [{
                        name: "filter",
                        padding: App.BOX_PADDING,
                        paddingTop: 5,
                        orientation: "vertical"
                    }]
                },
                {
                    name: "list",
                    fillContainer: true,
                    orientation: "vertical",
                    height: 1
                }, {
                    name: "contextMenu"
                }
            ]
        }
    }

}

class View extends Component {

    defaultConfiguration() {
        return Utils.Merge(super.defaultConfiguration(), {
            popup: {
                showCloseButton: true,
                contentTemplate: e => this.popupTemplate(e),
                onShown: e => this.popupOnShown(e),
                onHiding: e => this.popupOnHiding(e)
            }
        })
    }

    isPopup() {
        return this.configuration().mode == "popup";
    }

    isFullScreen() {
        return this.configuration().fullScreen == true;
    }

    render() {
        return this.initRender()
            .then(() =>
                this.beforeRender())
            .then(() =>
                this.renderComponents())
            .then(() =>
                this.renderTemplate())
            .then(() =>
                this.afterRender())
            .then(() =>
                this.endRender())
            .catch(err =>
                this.handleError(err))
    }

    initRender() {
        return Utils.EmptyPromise();
    }

    beforeRender() {}

    renderComponents() {
        Object.keys(this.components()).forEach(
            key => this.components()[key].render()
        )
    }

    components() {
        if (this._components == undefined) {
            this._components = this.defineComponents();
        }
        return this._components;
    }

    defineComponents() {
        const components = {};
        const configurationComponents = this.configuration().components || {};
        Object.keys(configurationComponents).forEach(
            key => {
                const component = this.defineComponent(key, configurationComponents[key]);
                if (component != undefined) {
                    components[key] = component;
                }
            }
        )
        return components;
    }

    defineComponent(key, configuration) {
        const componentClass = this.componentClass(key, configuration)
        if (componentClass != undefined) {
            if (configuration.element == undefined) {
                configuration.element = this.template().findElementByClass(configuration.templateClass || key);
            }
            if (0 < configuration.element.length) {
                configuration.parentView = this;
                return new(componentClass)(configuration);
            }
        }
    }

    componentClass(key, configuration) {
        let componentClass = configuration.componentClass;
        if (componentClass == undefined) {
            componentClass = this.componentsClasses().get(key);
        }
        return componentClass;
    }

    componentsClasses() {
        if (this._componentsClasses == undefined) {
            this._componentsClasses = this.defineComponentsClasses();
        }
        return this._componentsClasses;
    }

    defineComponentsClasses() {
        return new Map()
            .set("list", Grid)
            .set("grid", Grid)
            .set("toolbar", Toolbar)
            .set("contextMenu", ContextMenu)
            .set("form", Form)
            .set("button", Button)
            .set("label", Label)
            .set("treeItems", TreeItems)
            .set("filter", Form)
            .set("scheduler", Scheduler)
    }

    template() {
        if (this._template == undefined) {
            this._template = this.defineTemplate()
        }
        return this._template;
    }

    defineTemplate() {
        return this.configuration().template || this.templateDefault();
    }

    templateDefault() {
        return new Template()
    }

    renderTemplate() {
        if (this.isPopup()) {
            this.popup().show();
        } else {
            this.template().appendTo(this.element());
        }
    }

    popup() {
        if (this._popup == undefined) {
            this._popup = this.definePopup();
        }
        return this._popup;
    }

    definePopup() {
        return new Popup(this.configuration().popup);
    }

    afterRender() {
        if (this.isFullScreen()) {
            App.HideItems();
        }
        return this.loadState()
    }

    endRender() {
        if (this.isPopup()) {
            return new Promise((resolve, reject) => {
                this.resolveRender = resolve;
            });
        } else {
            return null;
        }
    }

    popupTemplate(e) {
        e.parent().css({
            "background-color": App.POPUP_BACKGROUND_COLOR,
            "padding-top": "5px"
        });
        e.css({
            "padding-top": "5px",
            "display": "flex",
            "flex-direction": "column"
        })
        this.template().appendTo(e)
    }

    parentView() {
        return this.configuration().parentView;
    }

    findElementByClass(className) {
        return this.template().findElementByClass(className);
    }

    focus() {}

    valueHasChanged(e) {
        return (e.previousValue == undefined || e.value == undefined || e.value.id != e.previousValue.id);
    }

    close(closeData) {
        if (this.isPopup()) {
            this._closeData = closeData;
            this.popup().close();
        } else {
            App.BlankViewElement()
        }
    }

    popupOnShown(e) {
        this.focus();
    }

    popupOnHiding(e) {
        this.resolveRender(this._closeData || this.closeDataDefault())
    }

    closeDataDefault() {
        return {}
    }

    handleError(err) {
        return Errors.Handle(err);
    }

    saveState() {
        return Users.SaveState({ module: this.className(), state: this.getState() })
    }

    getState() {}

    loadState() {
        return Users.GetState({ module: this.className() })
            .then(s => {
                this.state = s != null ? JSON.parse(s) : {};
                this.setState();
            })
    }

    setState() {}

}

class YesNoView extends MessageView {

    toolbarItems() {
        return [
            this.itemYes(),
            this.itemNo()
        ]
    }

    itemYes() {
        return ToolbarItem.Yes({
            onClick: e => this.yes()
        })
    }

    itemNo() {
        return ToolbarItem.No({
            onClick: e => this.no()
        })
    }

    yes() {
        this.okey();
    }

    no() {
        this.cancel();
    }

    cancel() {
        return this.close(this.closeDataCancel())
    }

    closeDataCancel() {
        return { okey: false };
    }

}

class Button extends Widget {

    widgetName() {
        return "dxButton"
    }

}

class ContextMenu extends Widget {

    widgetName() {
        return "dxContextMenu"
    }

    setItems(items) {
        if (items != undefined) {
            this.setProperty("items", Arrays.NoNulls(items));
        }
    }

}

class Form extends Widget {

    constructor(parameters) {
        super(parameters);
    }

    widgetName() {
        return "dxForm";
    }

    defaultConfiguration() {
        return Utils.Merge(super.defaultConfiguration(), {
            formData: {},
            labelLocation: "left",
            colCount: 1,
        })
    }

    getData() {
        return this.getProperty("formData");
    }

    getValue(dataField) {
        return this.getData()[dataField];
    }

    setData(data) {
        this.setProperty("formData", data);
    }

    clearData() {
        this.setData(null)
    }

    updateData(data) {
        this.instance().updateData(data);
        return data;
    }

    getItems() {
        return this.getProperty("items");
    }

    setItems(items) {
        this.setProperty("items", items);
    }

    getEditor(dataField) {
        return this.instance().getEditor(dataField);
    }

    getDate(dataField) {
        return Dates.Format(this.getEditorValue(dataField))
    }

    getSingleQuotes(dataField) {
        return Strings.SingleQuotes(this.getEditorValue(dataField))
    }

    getEditorProperty(dataField, propertyName) {
        return this.getEditor(dataField).option(propertyName);
    }

    getEditorValue(dataField) {
        return this.getEditorProperty(dataField, "value")
    }

    getEditorText(dataField) {
        return this.getEditorProperty(dataField, "text")
    }

    getEditorSelectedItem(dataField) {
        return this.getEditorProperty(dataField, "selectedItem");
    }

    getEditorSelectedValue(dataField, name) {
        const selectedItem = this.getEditorProperty(dataField, "selectedItem");
        if (selectedItem != undefined) {
            return selectedItem[name];
        }
    }

    setEditorProperty(dataField, propertyName, value) {
        this.getEditor(dataField).option(propertyName, value);
    }

    setEditorProperties(dataField, properties) {
        this.getEditor(dataField).option(properties);
    }

    setEditorValue(dataField, value) {
        this.setEditorProperty(dataField, "value", value)
    }

    refreshEditorValue(dataField, value) {
        this.setEditorValue(dataField, undefined);
        this.setEditorValue(dataField, value);
    }

    blankEditorValue(dataField) {
        this.setEditorProperties(dataField, {
            value: null,
            isValid: true
        })
    }

    setEditorDataSource(dataField, dataSource) {
        this.blankEditorValue(dataField)
        this.setEditorProperty(dataField, "dataSource", dataSource)
    }

    setArrayDataSource(dataField, rows) {
        this.setEditorDataSource(dataField, DsArray({ rows: rows }));
        if (rows != undefined && 0 < rows.length) {
            this.setEditorValue(dataField, rows[0].id)
        }
    }

    clearEditorDataSource(dataField) {
        this.setEditorDataSource(dataField, null);
    }

    focusEditor(dataField) {
        this.getEditor(dataField).focus();
    }

    saveData() {
        this._dataSaved = Utils.Clone(this.getData());
    }

    dataHasChanged() {

        function equals(value, valueSaved) {
            const x = Utils.IsObject(value) ? value.id : value;
            const xSaved = Utils.IsObject(valueSaved) ? valueSaved.id : valueSaved;
            return x == xSaved;
        }

        if (this._dataSaved == undefined) {
            return true;
        } else {
            const data = this.getData();
            return Object.keys(data).find(
                key => !equals(data[key], this._dataSaved[key])
            ) != undefined;
        }

    }

    getChangedData() {
        const data = Utils.ReduceIds(Utils.Clone(this.getData()));
        const dataSaved = Utils.ReduceIds(this._dataSaved);
        var updated = {};
        Object.keys(data).forEach(
            key => data[key] != this._dataSaved[key] ? updated[key] = data[key] : undefined
        )
        return updated;
    }

    toglePassword(dataField) {
        this.setEditorProperty(dataField, "mode",
            this.getEditorProperty(dataField, "mode") == "password" ? "text" : "password")
    }

    toglePasswords(dataFields) {
        dataFields.forEach(
            dataField => this.toglePassword(dataField)
        )
    }

    validate() {
        return new Promise(async(resolve, reject) => {
            let validate = this.instance().validate();
            if (validate.status == "pending") {
                validate = await validate.complete;
            }
            if (validate.isValid) {
                resolve(true)
            } else {
                reject(Exceptions.FormValidation())
            }
        })
    }

    onLoadedSetFirstValue(dataField) {
        return data =>
            data.length > 0 ? this.setEditorValue(dataField, data[0].id) : undefined;
    }

}

class Item {

    static Id() {
        return {
            dataField: "id",
            visible: false
        }
    }

    static DataField(p = {}) {

        function dataField() {
            return {
                dataField: p.dataField,
                isRequired: p.required == true,
                template: p.template,
                visible: p.visible,
                colSpan: p.colSpan,
                label: {
                    text: p.label,
                }
            }
        }

        function editorOptions() {
            return {
                editorOptions: {
                    showClearButton: p.clearButton == true,
                    inputAttr: {
                        class: p.cssInput || App.FONT_INPUT
                    },
                    width: p.width,
                    value: p.value,
                    placeholder: p.placeholder,
                    onValueChanged: p.onValueChanged,
                }
            }
        }

        function readOnly() {
            if (p.readOnly == true) {
                return {
                    editorOptions: {
                        readOnly: true,
                        focusStateEnabled: false,
                        inputAttr: {
                            class: p.cssInput || App.FONT_READ_ONLY
                        }
                    }
                }
            }
        }

        return Utils.Merge(dataField(), editorOptions(), readOnly())

    }

    static Text(p = {}) {

        function text() {
            return {
                editorType: "dxTextBox",
            }
        }

        function upperCase() {
            if (p.case == "upper") {
                return {
                    editorOptions: {
                        inputAttr: {
                            style: "text-transform: uppercase"
                        },
                        onValueChanged: e => e.value ? e.component.option("value", e.value.toUpperCase()) : undefined
                    }
                }
            }
        }

        return Utils.Merge(this.DataField(p), text(), upperCase())
    }

    static Number(p = {}) {

        function number() {
            return {
                editorType: "dxNumberBox",
                editorOptions: {
                    format: p.format || App.NUMBER_FORMAT,
                    width: p.width || App.NUMBER_WIDTH,
                    min: p.min,
                    max: p.max,
                    showSpinButtons: p.spin == true,
                    inputAttr: {
                        style: "text-align: right"
                    }
                }
            }
        }

        return Utils.Merge(this.DataField(p), number())
    }

    static DateLong(p = {}) {

        function date() {
            return {
                editorOptions: {
                    displayFormat: p.format || App.DATE_FORMAT_LONG,
                    width: p.width || App.DATE_WIDTH_LONG
                }
            }
        }
        return Utils.Merge(this.Date(p), date())
    }

    static Date(p = {}) {

        function date() {
            return {
                editorType: "dxDateBox",
                editorOptions: {
                    type: p.type || "date",
                    displayFormat: p.format || App.DATE_FORMAT,
                    useMaskBehavior: true,
                    applyValueMode: "instantly",
                    calendarOptions: {
                        showTodayButton: true
                    },
                    width: p.width || App.DATE_WIDTH
                }
            }
        }

        return Utils.Merge(this.DataField(p), date())

    }

    static Time(p = {}) {

        function time() {
            return {
                editorOptions: {
                    type: "time",
                    displayFormat: App.TIME_FORMAT,
                    width: App.TIME_WIDTH,
                }
            }
        }

        return Utils.Merge(this.Date(p), time())
    }

    static Lookup(p = {}) {

        function lookup() {
            return {
                editorType: "dxSelectBox",
                editorOptions: {
                    dataSource: p.dataSource,
                    displayExpr: p.displayExpr || App.DISPLAY_EXPR,
                    valueExpr: "id",
                    searchEnabled: p.editable == true,
                    deferRendering: p.deferRendering,
                    buttons: p.extraButton != undefined ? ["dropDown", p.extraButton] : undefined,
                    onSelectionChanged: p.onSelectionChanged
                }
            }
        }

        return Utils.Merge(this.DataField(p), lookup());

    }

    static Button(p = {}) {
        return {
            itemType: "button",
            horizontalAlignment: p.align,
            buttonOptions: {
                text: p.text,
                onClick: p.onClick,
                icon: p.icon,
                type: p.type,
                width: p.width,
                focusStateEnabled: false,
                hint: p.hint
            }
        }
    }

    static Check(p = {}) {

        function check() {
            return {
                editorType: "dxCheckBox",
                editorOptions: {
                    onValueChanged: e => e.component.option("value", e.value == true ? 1 : 0)
                }
            }
        }

        return Utils.Merge(this.DataField(p), check())
    }

    static Group(p = {}) {
        return Utils.Merge({
            itemType: "group"
        }, p)
    }

    static Space() {
        return ({ itemType: "empty" })
    }

    static Blank() {
        return this.Space()
    }

    static Apellido(p = {}) {
        return this.Text(Utils.Merge({
            dataField: "apellido",
            required: true
        }, p))
    }

    static Nombre(p = {}) {
        return this.Text(Utils.Merge({
            dataField: "nombre",
            required: true
        }, p))
    }

    static Email(p = {}) {
        return {
            dataField: p.dataField || "email",
            isRequired: p.required == true,
            editorOptions: {
                showClearButton: p.clearButton == true,
                mode: "email",
                width: p.width || App.EMAIL_WIDTH,
                inputAttr: {
                    autocomplete: "on"
                }
            },
        }
    }

    static RepeatEmail(p = {}) {
        return {
            dataField: p.dataField || "repeatEmail",
            isRequired: p.required || true,
            label: {
                text: p.text || "Repite el Email"
            },
            editorOptions: {
                width: p.width || App.EMAIL_WIDTH,
            }
        }
    }

    static Password(p = {}) {
        return {
            dataField: p.dataField || "password",
            isRequired: p.required || true,
            editorOptions: {
                mode: "password",
                width: p.width || 150,
            }
        }
    }

    static RepeatPassword(p = {}) {
        return {
            dataField: p.dataField || "repeatPassword",
            isRequired: p.required || true,
            label: {
                text: p.text || "Repite el password"
            },
            editorOptions: {
                mode: "password",
                width: p.width || 150,
            }
        }
    }

    static ToglePassword(p = {}) {
        return {
            dataField: p.dataField || "showPassword",
            editorType: "dxCheckBox",
            label: {
                text: p.text || "Muestra el password"
            },
            editorOptions: {
                onValueChanged: p.onClick || (e => Utils.Evaluate(p.form).toglePassword("password"))
            }
        }
    }

    static RecoverPassword(p = {}) {
        return {
            itemType: "button",
            buttonOptions: {
                visible: p.visible,
                text: p.text || "Olvidé el password",
            }
        }
    }

    static ReadOnly(p = {}) {
        p.readOnly = true;
        return this.Text(p)
    }

}

class Grid extends List {

    widgetName() {
        return "dxDataGrid";
    }

}

class Label extends Component {

    render() {
        if (this.configuration().visible != false) {
            this.setText(this.configuration().text)
            if (this.configuration().styles != undefined) {
                this.setStyles(this.configuration().styles)
            }
        }
    }

    setText(text) {
        this.element().text(text);
    }

    setHtml(html) {
        this.element().html(html)
    }

    setStyles(styles) {
        this.element().css(styles)
    }

    setVisible(visible) {
        this.element().hide();
    }

}

class List extends Widget {

    defaultConfiguration() {
        return Utils.Merge(super.defaultConfiguration(), {
            focusedRowEnabled: true,
            focusedRowIndex: 0,
            hoverStateEnabled: true,
            allowColumnResizing: true,
            allowColumnReordering: true,
            columnsAutoWidth: true,
            showColumnLines: true,
            showBorders: false,
            sorting: {
                mode: "multiple"
            },
            groupPanel: {
                visible: true
            },
            grouping: {
                autoExpandAll: true,
                contextMenuEnabled: true
            },
            searchPanel: {
                visible: true
            },
            editing: {
                confirmDelete: false,
            },
        })
    }

    configuration() {
        const c = super.configuration();
        return c;
    }

    rows() {
        return this.instance().getVisibleRows();
    }

    rowCount() {
        return this.rows().length;
    }

    hasRows() {
        return 0 < this.rowCount();
    }

    rowData(rowIndex) {
        return this.rows()[rowIndex].data;
    }

    rowValue(rowIndex, dataField) {
        return this.rowData(rowIndex)[dataField];
    }

    focusedRowIndex() {
        return this.getProperty("focusedRowIndex");
    }

    focusedRow() {
        return this.rows()[this.focusedRowIndex()];
    }

    focusedRowData() {
        const row = this.focusedRow();
        if (row != undefined) {
            return row.data;
        }
    }

    focusedRowIsData() {
        const row = this.focusedRow();
        return row != undefined && row.rowType == "data";
    }

    focusedRowValue(dataField) {
        const data = this.focusedRowData();
        if (data != undefined) {
            return data[dataField];
        }
    }

    id() {
        const data = this.focusedRowData();
        if (data != undefined) {
            return data.id;
        }
    }

    firstId() {
        return this.rowData(0).id;
    }

    deleteRow(parameters) {
        return new Rest({ path: parameters.path }).promise({
                verb: "delete",
                data: { id: parameters.id }
            })
            .then(() =>
                this.instance().refresh())
    }

    setDataSource(dataSource) {
        this.setProperty("dataSource", dataSource);
    }

    setArrayDataSource(rows) {
        this.setDataSource(DsArray({ rows: rows }))
    }

    clearDataSource() {
        this.setDataSource(null);
    }

    getDataSource() {
        return this.getProperty("dataSource");
    }

    store() {
        return this.dataSource().store();
    }

    refresh(id) {
        this.instance().refresh().then(
            () =>
            id ? this.focusRowById(id) : undefined
        )
    }

    focusFirstRow(focus = false) {
        this.setProperty("focusedRowIndex", 0);
    }

    focusRowById(id) {
        this.setProperty("focusedRowKey", id);
        this.navigateToRow(id);
        this.focus();
    }

    navigateToRow(id) {
        this.instance().navigateToRow(id);
    }

    setToolbarItems(items) {
        if (items != undefined) {
            this.setProperty("toolbar.items", Arrays.NoNulls(items));
        }
    }

    selectAll() {
        this.instance().selectAll()
    }

    deselectAll() {
        this.instance().deselectAll()
    }

    selectedRowKeys() {
        return this.instance().getSelectedRowKeys("all");
    }

    insertRow(data) {
        return this.store().insert(data).then(p =>
            this.refresh(data.id)
        )
    }

    isEmpty() {
        return !this.hasRows();
    }

    hasSearchText() {
        return this.getProperty("searchPanel.text") != "";
    }

    resetColumns(columns) {
        this.beginUpdate();
        try {
            this.deleteColumns();
            this.setColumns(columns);
        } finally {
            this.endUpdate();
        }
    }

    deleteColumns() {
        this.setProperty("columns", [])
    }

    setColumns(columns) {
        this.setProperty("columns", columns)
    }

    getEditColumnName() {
        return this.getProperty("editing.editColumnName");
    }

    cancelEdit() {
        this.instance().cancelEditData()
    }

    isFiltered() {
        return this.instance().getCombinedFilter() != undefined;
    }

    getFilters() {
        return this.instance().getCombinedFilter();
    }

    columnCount() {
        return this.instance().getVisibleColumns().length;
    }

    getState() {
        return this.instance().state();
    }

    setState(state) {
        this.instance().state(state);
        return this;
    }

    collapseAll() {
        this.instance().collapseAll()
    }

    expandAll() {
        this.instance().expandAll()
    }

    hasGroupedColumns() {
        return this.getColumns().find(
            column => this.instance().columnOption(column.dataField, "groupIndex") != undefined
        ) != undefined
    }

    getColumns() {
        return this.getProperty("columns");
    }

    setColumnProperties(dataField, properties) {
        this.instance().columnOption(dataField, properties);
        return this;
    }

    updateRow(id, data) {
        var rowIndex = this.rowIndexById(id);
        this.beginUpdate();
        try {
            Object.keys(data).forEach(
                key => this.instance().cellValue(rowIndex, key, data[key])
            )
        } finally {
            this.endUpdate();
        }
    }

    rowIndexById(id) {
        return this.instance().getRowIndexByKey(id);
    }

    focusNextRow() {
        if (this.hasNextRow()) {
            this.focusRowByIndex(this.focusedRowIndex() + 1);
            return true;
        }
        return false;
    }

    focusPriorRow() {
        if (this.hasPriorRow()) {
            this.focusRowByIndex(this.focusedRowIndex() - 1);
            return true;
        }
        return false;
    }

    hasNextRow() {
        return this.focusedRowIndex() < this.rowCount() - 1;
    }

    hasPriorRow() {
        return (0 < this.focusedRowIndex());
    }

    focusRowByIndex(rowIndex) {
        this.setProperty("focusedRowIndex", rowIndex);
    }

    hasNextRow() {
        return this.focusedRowIndex() < this.rowCount() - 1;
    }

    isEditing() {
        return this.instance().hasEditData();
    }

    saveEdit() {
        return this.instance().saveEditData();
    }

    cancelEdit() {
        return this.instance().cancelEditData();
    }

    showSummary(show = true) {
        this.setProperty("summary.visible", false)
    }

}

class Column {

    static BaseColumn(p = {}) {
        return {
            dataField: p.dataField,
            name: p.name,
            dataType: p.dataType,
            format: p.format,
            caption: p.caption,
            width: p.width,
            groupIndex: p.groupIndex,
            calculateCellValue: p.formula,
            allowHeaderFiltering: p.filtering != false,
            allowSorting: p.sorting != false,
            allowEditing: p.editing != false,
            allowGrouping: true,
            visible: p.visible != false,
            cellTemplate: p.template,
            editCellTemplate: p.editor,
            headerFilter: {
                width: p.filterWidth
            },
            sortingMethod: p.sort
        }
    }

    static Id(p = {}) {
        return Utils.Merge({
            dataField: App.KEY_NAME,
            visible: false
        }, p)
    }

    static Text(p) {
        return this.BaseColumn(p)
    }

    static Date(p) {
        return this.BaseColumn(Utils.Merge({
            dataType: "date",
            format: p.format || App.DATE_FORMAT,
        }, p))
    }

    static Time(p) {
        return this.BaseColumn(Utils.Merge({
            dataType: "time",
            format: p.format || App.TIME_FORMAT,
        }, p))
    }

    static Calculated(p) {
        return this.BaseColumn(p)
    }

    static Invisible(p = {}) {
        return this.BaseColumn(Utils.Merge({
            visible: false
        }, p))
    }

    static Space() {
        return {}
    }

}

class Popup extends Widget {

    widgetName() {
        return "dxPopup";
    }

    defaultConfiguration() {
        return Utils.Merge(super.defaultConfiguration(), {
            showCloseButton: true,
            backgroundColor: App.POPUP_BACKGROUND_COLOR,
            shading: true,
            removeOnClose: true
        })
    }

    defineElement() {
        var element;
        var i = 1;
        while ($("#" + App.POPUP_PREFFIX_ID + "-" + i).length) {
            i++
        }
        element = $("<div id='" + App.POPUP_PREFFIX_ID + "-" + i + "'>").dxPopup(this.parameters());
        $("body").append(element);
        return element;
    }

    render() {
        this.show();
    }

    show() {
        this.instance().show()
    }

    hide() {
        this.instance().hide();
    }

    close() {
        this.hide();
        this.element().remove();
    }

    setTitle(title) {
        this.setProperty("title", title);
    }

}

class Resizer extends Widget {

    widgetName() {
        return "dxResizable";
    }

}

class Scheduler extends Widget {

    widgetName() {
        return "dxScheduler";
    }

    defaultConfiguration() {
        return Utils.Merge(super.defaultConfiguration(), {
            timeZone: App.ZONA_HORARIA_ARGENTINA,
            currentView: 'week',
            startDayHour: 7,
            endDayHour: 22,
            showAllDayPanel: false,
            showCurrentTimeIndicator: false,
            startDateExpr: "fechaDesde",
            endDateExpr: "fechaHasta",
        })
    }

}

class Toolbar extends Widget {

    widgetName() {
        return "dxToolbar"
    }

    setItems(items) {
        this.setProperty("items", Arrays.NoNulls(items));
    }

}

class ToolbarItem {

    static Okey(p) {
        return Utils.Merge({
            widget: "dxButton",
            location: "after",
            options: {
                text: "Okey",
                icon: "check",
            }
        }, p)
    }

    static Insert(p) {
        return Utils.Merge({
            widget: "dxButton",
            location: "before",
            options: {
                icon: "plus",
                hint: "Agrega",
            }
        }, p)
    }

    static Cancel(p) {
        return Utils.Merge({
            widget: "dxButton",
            location: "after",
            options: {
                text: "Cancela",
                icon: "close",
            }
        }, p)
    }

    static Yes(p) {
        return Utils.Merge({
            widget: "dxButton",
            location: "after",
            options: {
                text: "Si",
            }
        }, p)
    }

    static No(p) {
        return Utils.Merge({
            widget: "dxButton",
            location: "after",
            options: {
                text: "No",
            }
        }, p)
    }

    static WantToRegister(p) {
        return Utils.Merge({
            widget: "dxButton",
            location: p.location || "before",
            options: {
                text: "Me quiero registrar",
                icon: "user",
            }
        }, p)
    }

}

class TreeItems extends Widget {

    widgetName() {
        return "dxTreeList";
    }

    defaultConfiguration() {
        return Utils.Merge(super.defaultConfiguration(), {
            keyExpr: "id",
            dataStructure: "tree",
            focusedRowEnabled: true,
            focusedRowIndex: 0,
            autoExpandAll: true,
            showColumnHeaders: false,
            columns: [
                "text"
            ],
            onFocusedRowChanged: e => this.onFocusedRowChanged(e)
        })
    }

    focusFirstRow() {
        this.setProperty("focusedRowIndex", 0)
    }

    onFocusedRowChanged(e) {
        if (e.row.data.onClick) {
            e.row.data.onClick();
        }
    }

}

class TreeItem {

    constructor(configuration) {
        this.items = [];
        Object.keys(configuration).forEach(
            key => this[key] = configuration[key]
        )
        if (this.id == undefined) {
            this.id = this.parent ? this.parent.id + "_" + this.parent.items.length : "1";
        }
    }

    addChild(configuration) {
        this.add(configuration);
        return this;
    }

    add(configuration) {
        return this.items[
            this.items.push(
                new TreeItem(
                    Utils.Merge({ parent: this },
                        configuration
                    )
                )
            ) - 1
        ]
    }

    upLevel() {
        return this.parent;
    }

}

class Widget extends Component {

    render() {
        if (this.instance() == undefined) {
            this.element()[this.widgetName()](this.configuration());
        }
        return this;
    }

    instance() {
        try {
            return this.element()[this.widgetName()]("instance");
        } catch (e) {
            return undefined;
        }
    }

    getProperty(propertyName) {
        return this.instance().option(propertyName);
    }

    setProperty(propertyName, value) {
        this.instance().option(propertyName, value);
    }

    setProperties(properties) {
        this.instance().option(properties);
    }

    focus() {
        this.instance().focus();
    }

    beginUpdate() {
        this.instance().beginUpdate();
    }

    endUpdate() {
        this.instance().endUpdate();
    }

    isReady() {
        return this.instance() != undefined
    }

    getWidth() {
        return this.getProperty("width")
    }

    setWidth(width) {
        this.setProperty("width", width)
    }

}

