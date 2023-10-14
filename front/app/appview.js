class AppView extends AppViewBase {

    itemsDataSource() {

        const itemDatos = new TreeItem({
            id: "1",
            text: "Datos Generales"
        });

        const itemAñoLectivo = new TreeItem({
            id: "2",
            text: "Año Lectivo",
        })

        const itemCalificaciones = new TreeItem({
            id: "3",
            text: "Calificaciones"
        });

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

        itemAñoLectivo.addChild({
            text: "Períodos",
            onClick: e => new Periodos().render()
        })

        itemAñoLectivo.addChild({
            text: "Valoraciones Pedagógicas",
            onClick: e => new Valoraciones().render()
        })

        itemAñoLectivo.addChild({
            text: "Cursos",
            onClick: e => new Cursos().render()
        })

        itemAñoLectivo.addChild({
            text: "Horarios",
            onClick: e => new MateriasHoras().render()
        })

        itemCalificaciones.addChild({
            text: "Examenes",
            onClick: e => new ExamenesCurso().render()
        })

        itemCalificaciones.addChild({
            text: "Notas",
            onClick: e => new Notas().render()
        })

        /*        
                itemCalificaciones.addChild({
                    text: "Cursos y Materias",
                    onClick: e => new CursosMaterias().render()
                })
        */

        return [itemDatos, itemAñoLectivo, itemCalificaciones, itemSalida];

    }

}