select
    cur.id,
    cur.añolectivo,
    cur.escuela,
    cur.modalidad,
    cur.año,
    cur.division,
    cur.turno
from
    cursos cur
where
    (
        cur.id = 'cl18xtdgy00024wsrb8mqhyfx'
        and (
            cur.tenant = 'cl18w2v0100015ksr195y6lvf'
            AND cur.state in (1)
        )
    )