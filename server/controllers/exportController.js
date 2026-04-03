import ExcelJS from 'exceljs'
import { fetchFlatApplications } from './applicationController.js'

/**
 * GET /api/export
 * Admin: export filtered applications as Excel
 */
export async function exportApplications(req, res) {
  try {
    const data = await fetchFlatApplications(req.query)

    const workbook  = new ExcelJS.Workbook()
    workbook.creator = 'PhD Admission Portal'
    workbook.created  = new Date()

    const ws = workbook.addWorksheet('PhD Applicants', {
      pageSetup: { fitToPage: true, orientation: 'landscape' },
    })

    // ── Column definitions ──
    ws.columns = [
      { header: '#',                 key: 'idx',             width: 5  },
      { header: 'Name',              key: 'name',            width: 25 },
      { header: 'Email',             key: 'email',           width: 28 },
      { header: 'DOB',               key: 'dob',             width: 12 },
      { header: 'Category',          key: 'category',        width: 10 },
      { header: 'Phone',             key: 'phone',           width: 14 },
      { header: '10th %',            key: 'pct_10th',        width: 9  },
      { header: '12th %',            key: 'pct_12th',        width: 9  },
      { header: 'Graduation %',      key: 'pct_grad',        width: 14 },
      { header: 'Post Graduation %', key: 'pct_pg',          width: 18 },
      { header: 'CGPA',              key: 'cgpa',            width: 8  },
      { header: 'Grad Marks %',      key: 'graduation_marks',width: 13 },
      { header: 'GATE Score',        key: 'gate_score',      width: 12 },
      { header: 'GATE Year',         key: 'gate_year',       width: 11 },
      { header: 'CSIR Score',        key: 'csir_score',      width: 12 },
      { header: 'CSIR Year',         key: 'csir_year',       width: 11 },
      { header: 'NBHM Eligible',     key: 'nbhm_eligible',   width: 14 },
      { header: 'Applied Date',      key: 'created_at',      width: 14 },
    ]

    // ── Style header row ──
    const headerRow = ws.getRow(1)
    headerRow.eachCell(cell => {
      cell.fill = {
        type: 'pattern', pattern: 'solid',
        fgColor: { argb: 'FF4338CA' }, // indigo-700
      }
      cell.font   = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }
      cell.alignment = { vertical: 'middle', horizontal: 'center' }
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'FF6366F1' } },
      }
    })
    headerRow.height = 24

    // ── Add data rows ──
    data.forEach((row, i) => {
      const r = ws.addRow({
        idx:              i + 1,
        name:             row.name,
        email:            row.email,
        dob:              row.dob,
        category:         row.category,
        phone:            row.phone,
        pct_10th:         row.pct_10th,
        pct_12th:         row.pct_12th,
        pct_grad:         row.pct_grad,
        pct_pg:           row.pct_pg,
        cgpa:             row.cgpa,
        graduation_marks: row.graduation_marks,
        gate_score:       row.gate_score,
        gate_year:        row.gate_year,
        csir_score:       row.csir_score,
        csir_year:        row.csir_year,
        nbhm_eligible:    row.nbhm_eligible ? 'Yes' : 'No',
        created_at:       row.created_at ? new Date(row.created_at).toLocaleDateString() : '',
      })

      // Zebra striping
      if (i % 2 === 0) {
        r.eachCell(cell => {
          cell.fill = {
            type: 'pattern', pattern: 'solid',
            fgColor: { argb: 'FFF1F5F9' }, // slate-100
          }
        })
      }

      // NBHM highlight
      const nbhmCell = r.getCell('nbhm_eligible')
      if (row.nbhm_eligible) {
        nbhmCell.font = { bold: true, color: { argb: 'FF16A34A' } }
      }

      r.alignment = { vertical: 'middle' }
    })

    // ── Freeze header ──
    ws.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }]

    // ── Auto filter ──
    ws.autoFilter = {
      from: { row: 1, column: 1 },
      to:   { row: 1, column: ws.columns.length },
    }

    // ── Stream to response ──
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="phd_applications_${Date.now()}.xlsx"`)
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition')

    await workbook.xlsx.write(res)
    res.end()
  } catch (err) {
    console.error('exportApplications error:', err)
    res.status(500).json({ error: err.message })
  }
}
