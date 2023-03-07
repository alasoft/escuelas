class Scheduler extends Widget {

    widgetName() {
        return "dxScheduler";
    }

    defaultConfiguration() {
        return Utils.Merge(super.defaultConfiguration(), {
            timeZone: App.ZONA_HORARIA_ARGENTINA,
            currentView: 'week',
            startDayHour: 9,
            endDayHour: 23,
            showAllDayPanel: false,
            showCurrentTimeIndicator: false,
            startDateExpr: "desde",
            endDateExpr: "hasta",
        })
    }

}