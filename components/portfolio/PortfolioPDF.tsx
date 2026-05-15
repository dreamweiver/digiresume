import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer'
import type { PortfolioData } from '@/lib/portfolio-types'

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#1e293b' },
  name: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  title: { fontSize: 13, color: '#475569', marginBottom: 4 },
  bio: { fontSize: 10, color: '#64748b', marginBottom: 16 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 4,
    marginBottom: 8,
    marginTop: 16,
  },
  entryTitle: { fontSize: 11, fontWeight: 'bold' },
  entrySubtitle: { fontSize: 10, color: '#475569' },
  entryDate: { fontSize: 9, color: '#94a3b8', marginBottom: 3 },
  entryDescription: { fontSize: 10, color: '#475569', lineHeight: 1.4 },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  skill: { backgroundColor: '#f1f5f9', padding: '3 6', borderRadius: 3, fontSize: 9 },
  socialRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
})

interface Props {
  data: PortfolioData
}

export function PortfolioPDF({ data }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{data.hero.name}</Text>
        <Text style={styles.title}>{data.hero.title}</Text>
        <Text style={styles.bio}>{data.hero.bio}</Text>
        <View style={styles.socialRow}>
          {data.socialLinks.github ? (
            <Link src={data.socialLinks.github}>
              <Text style={{ fontSize: 9, color: '#3b82f6' }}>GitHub</Text>
            </Link>
          ) : null}
          {data.socialLinks.linkedin ? (
            <Link src={data.socialLinks.linkedin}>
              <Text style={{ fontSize: 9, color: '#3b82f6' }}>LinkedIn</Text>
            </Link>
          ) : null}
          {data.socialLinks.website ? (
            <Link src={data.socialLinks.website}>
              <Text style={{ fontSize: 9, color: '#3b82f6' }}>Website</Text>
            </Link>
          ) : null}
        </View>
        {data.about ? (
          <>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.entryDescription}>{data.about}</Text>
          </>
        ) : null}
        {data.skills.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsRow}>
              {data.skills.map((s) => (
                <Text key={s} style={styles.skill}>
                  {s}
                </Text>
              ))}
            </View>
          </>
        ) : null}
        {data.experience.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Experience</Text>
            {data.experience.map((e, i) => (
              <View key={i} style={{ marginBottom: 8 }}>
                <Text style={styles.entryTitle}>{e.role}</Text>
                <Text style={styles.entrySubtitle}>{e.company}</Text>
                <Text style={styles.entryDate}>
                  {e.startDate} – {e.endDate}
                </Text>
                <Text style={styles.entryDescription}>{e.description}</Text>
              </View>
            ))}
          </>
        ) : null}
        {data.projects.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Projects</Text>
            {data.projects.map((p, i) => (
              <View key={i} style={{ marginBottom: 8 }}>
                <Text style={styles.entryTitle}>{p.name}</Text>
                <Text style={styles.entryDescription}>{p.description}</Text>
                <Text style={{ fontSize: 9, color: '#64748b' }}>{p.techStack.join(' · ')}</Text>
              </View>
            ))}
          </>
        ) : null}
        {data.education.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Education</Text>
            {data.education.map((e, i) => (
              <View key={i} style={{ marginBottom: 6 }}>
                <Text style={styles.entryTitle}>{e.degree}</Text>
                <Text style={styles.entrySubtitle}>{e.institution}</Text>
                <Text style={styles.entryDate}>
                  {e.startDate} – {e.endDate}
                </Text>
              </View>
            ))}
          </>
        ) : null}
      </Page>
    </Document>
  )
}
