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