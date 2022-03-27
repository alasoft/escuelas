select
    cur.id,
    cur.añolectivo,
    cur.escuela,
    cur.modalidad,
    cur.año,
    cur.division,
    cur.turno,
    esc.nombre as escuelanombre,
    mod.nombre as modalidadnombre
from
    cursos cur
    left join escuelas esc on (
        (
            (
                esc.tenant = 'test'
                AND esc.state in (1)
            )
            AND esc.id = cur.escuela
        )
    )
    left join modalidades mod on (
        (
            (
                mod.tenant = 'test'
                AND mod.state in (1)
            )
            AND mod.id = cur.modalidad
        )
    )
where
    (
        cur.añolectivo = 2022
        and (
            cur.tenant = 'test'
            AND cur.state in (1)
        )
    )
order by
    esc.nombre,
    mod.nombre,
    cur.año,
    cur.division,
    cur.turno