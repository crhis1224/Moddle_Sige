import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import logoteba from "../../assets/telebachillerato.png";
import LogoGobMich from "../../assets/LogoGobMich.png";

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 9, fontFamily: 'Helvetica' },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  logoLeft: { width: 80, height: 120, objectFit: 'contain' },
  logoRight: { width: 70, height: 90, objectFit: 'contain' },
  headerTextContent: { flex: 1, textAlign: 'center', alignItems: 'center', paddingHorizontal: 5 },
  titleMain: { fontSize: 12, fontWeight: 'bold' },
  titleSub: { fontSize: 10 },
  titleKardex: { fontSize: 11, fontWeight: 'bold', marginTop: 2, textDecoration: 'underline' },
  centroText: { fontSize: 10, fontWeight: 'bold', marginTop: 4 },
  infoRowInline: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 4, fontSize: 8 },
  studentNameRow: { textAlign: 'center', marginBottom: 15, fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', marginTop: 10, borderTopWidth: 1, borderTopColor: '#000', paddingTop: 5 },
  labelBold: { fontWeight: 'bold' },
  table: { display: 'flex', width: '100%', borderStyle: 'solid', borderWidth: 1, borderRightWidth: 0, borderBottomWidth: 0 },
  tableRow: { flexDirection: 'row' },
  tableColHeader: { borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, backgroundColor: '#f0f0f0' },
  tableCol: { borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0 },
  tableCell: { margin: 4, textAlign: 'center', fontSize: 8 },
  colMateria: { width: '40%' },
  colNota: { width: '10%' },
  colTipo: { width: '20%' },
  summaryBox: { marginTop: 20, flexDirection: 'row', justifyContent: 'flex-end' },
  summaryText: { fontSize: 10, fontWeight: 'bold', borderTopWidth: 1, borderBottomWidth: 1, padding: 5 },
});

export const BoletaOficialPDF = ({ studentName, subjects, periodo, semestre, divisorPlan }: any) => {
  
  // Función para procesar cada materia individualmente
  const getRowData = (s: any) => {
    // Validamos que existan los 3 parciales para poder promediar la materia
    const tieneP1 = s.parcial1 !== null && s.parcial1 !== undefined && s.parcial1 !== "";
    const tieneP2 = s.parcial2 !== null && s.parcial2 !== undefined && s.parcial2 !== "";
    const tieneP3 = s.parcial3 !== null && s.parcial3 !== undefined && s.parcial3 !== "";

    // Si falta algún parcial, la materia está incompleta
    if (!tieneP1 || !tieneP2 || !tieneP3) {
      return { final: 0, label: "S/C", tipo: "EN CURSO", completo: false };
    }

    const p1 = Number(s.parcial1);
    const p2 = Number(s.parcial2);
    const p3 = Number(s.parcial3);
    const promParciales = (p1 + p2 + p3) / 3;

    if (promParciales >= 6.0) {
      return { 
        final: promParciales, 
        label: promParciales.toFixed(2), 
        tipo: "ORDINARIO", 
        completo: true 
      };
    } else {
      // Verificamos si tiene calificación de extraordinario
      const tieneExtra = s.examenExtraordinario !== null && s.examenExtraordinario !== undefined && s.examenExtraordinario !== "";
      if (tieneExtra) {
        const extra = Number(s.examenExtraordinario);
        return { 
          final: extra, 
          label: extra.toFixed(2), 
          tipo: "EXTRAORDINARIO", 
          completo: true 
        };
      }
      return { final: 0, label: "P.E.", tipo: "A EXTRA (PEND)", completo: false };
    }
  };

  // --- LÓGICA DE PROMEDIO GENERAL ACTUALIZADA ---
  
  // 1. Solo tomamos en cuenta las materias que están marcadas como 'completo' (tienen 3 parciales)
  const materiasTerminadas = subjects ? subjects.filter((s: any) => getRowData(s).completo) : [];
  
  // 2. El divisor es el oficial del plan de estudios (por ejemplo, 7)
  const divisorFinal = Number(divisorPlan) || 1;

  // 3. Sumamos los promedios finales de las materias terminadas
  const sumaNotasFinales = materiasTerminadas.reduce((acc: number, curr: any) => {
    return acc + getRowData(curr).final;
  }, 0);

  // 4. Calculamos el promedio. Si no hay materias terminadas, el promedio es 0.00
  const promedioGeneral = materiasTerminadas.length > 0 
    ? (sumaNotasFinales / divisorFinal).toFixed(2)
    : "0.00";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Encabezado con Logos y Texto */}
        <View style={styles.headerContainer}>
          <Image style={styles.logoLeft} src={logoteba} />
          <View style={styles.headerTextContent}>
            <Text style={styles.titleMain}>TELEBACHILLERATO MICHOACÁN</Text>
            <Text style={styles.titleSub}>Organismo Público Descentralizado</Text>
            <Text style={styles.titleKardex}>BOLETA DE CALIFICACIONES</Text>
            <Text style={styles.centroText}>CENTRO: TELEBACHILLERATO 204</Text>
            <View style={styles.infoRowInline}>
              <Text><Text style={styles.labelBold}>CLAVE:</Text> 16ETH0204X</Text>
              <Text><Text style={styles.labelBold}>No. DE SEMESTRE:</Text> {semestre || 'S/N'}</Text>
              <Text><Text style={styles.labelBold}>PERIODO:</Text> {periodo || 'S/N'}</Text>
            </View>
          </View>
          <Image style={styles.logoRight} src={LogoGobMich} />
        </View>

        <View style={styles.studentNameRow}>
          <Text>ALUMNO: {studentName}</Text>
        </View>

        {/* Tabla de Calificaciones */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, styles.colMateria]}><Text style={styles.tableCell}>ASIGNATURA</Text></View>
            <View style={[styles.tableColHeader, styles.colNota]}><Text style={styles.tableCell}>P1</Text></View>
            <View style={[styles.tableColHeader, styles.colNota]}><Text style={styles.tableCell}>P2</Text></View>
            <View style={[styles.tableColHeader, styles.colNota]}><Text style={styles.tableCell}>P3</Text></View>
            <View style={[styles.tableColHeader, styles.colNota]}><Text style={styles.tableCell}>FINAL</Text></View>
            <View style={[styles.tableColHeader, styles.colTipo]}><Text style={styles.tableCell}>ESTATUS</Text></View>
          </View>

          {subjects && subjects.length > 0 ? (
            subjects.map((item: any, index: number) => {
              const row = getRowData(item);
              return (
                <View style={styles.tableRow} key={index}>
                  <View style={[styles.tableCol, styles.colMateria]}>
                    <Text style={[styles.tableCell, { textAlign: 'left' }]}>
                      {item.subjectName || "Sin Nombre"}
                    </Text>
                  </View>
                  {/* Si el parcial no existe, mostramos guiones para rellenar el espacio */}
                  <View style={[styles.tableCol, styles.colNota]}><Text style={styles.tableCell}>{item.parcial1 || "---"}</Text></View>
                  <View style={[styles.tableCol, styles.colNota]}><Text style={styles.tableCell}>{item.parcial2 || "---"}</Text></View>
                  <View style={[styles.tableCol, styles.colNota]}><Text style={styles.tableCell}>{item.parcial3 || "---"}</Text></View>
                  <View style={[styles.tableCol, styles.colNota]}>
                    <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>{row.label}</Text>
                  </View>
                  <View style={[styles.tableCol, styles.colTipo]}>
                    <Text style={[styles.tableCell, { fontSize: 7 }]}>{row.tipo}</Text>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.tableRow}>
              <View style={[styles.tableCol, { width: '100%' }]}><Text style={styles.tableCell}>No hay materias cargadas</Text></View>
            </View>
          )}
        </View>

        {/* Resumen de Promedio y Divisor Oficial */}
        <View style={styles.summaryBox}>
          <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
            <Text style={styles.summaryText}>PROMEDIO GENERAL: {promedioGeneral}</Text>
            <View style={{ marginTop: 4, alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 7, color: 'grey' }}>Divisor oficial del plan: {divisorFinal}</Text>
              <Text style={{ fontSize: 7, color: 'grey' }}>Materias promediadas: {materiasTerminadas.length}</Text>
              {materiasTerminadas.length < divisorFinal && (
                <Text style={{ fontSize: 7, color: '#d35400', marginTop: 2 }}>
                  * El promedio aumentará conforme se completen las materias del plan.
                </Text>
              )}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};