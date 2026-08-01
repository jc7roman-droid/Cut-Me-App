import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

type Service = { id: string; name: string; duration: number; price: number; description: string };
type Barber = { id: string; name: string; specialty: string; initials: string };
type Appointment = { service: Service; barber: Barber; date: string; time: string };
type Step = 'home' | 'service' | 'barber' | 'time' | 'review' | 'confirmed';

const services: Service[] = [
  { id: 'haircut', name: 'Signature Haircut', duration: 40, price: 50, description: 'Consultation, tailored cut, and finish.' },
  { id: 'beard', name: 'Haircut + Beard', duration: 60, price: 60, description: 'Complete haircut with beard shaping and line-up.' },
  { id: 'hot-towel', name: 'Cut, Beard + Hot Towel', duration: 75, price: 75, description: 'Our full grooming experience.' },
  { id: 'kids', name: 'Kids Cut', duration: 40, price: 40, description: 'A precise, comfortable cut for ages 12 and under.' },
];

const barbers: Barber[] = [
  { id: 'any', name: 'Any Available', specialty: 'Get the earliest opening', initials: 'AA' },
  { id: 'marcus', name: 'Marcus', specialty: 'Fades & beard work', initials: 'MC' },
  { id: 'andre', name: 'Andre', specialty: 'Classic cuts', initials: 'AR' },
  { id: 'jay', name: 'Jay', specialty: 'Texture & modern styles', initials: 'JY' },
];

const dates = ['Today · Jul 31', 'Tomorrow · Aug 1', 'Sunday · Aug 2'];
const times = ['9:00 AM', '10:20 AM', '11:40 AM', '1:20 PM', '2:40 PM', '4:00 PM', '5:20 PM'];

export default function App() {
  const { width } = useWindowDimensions();
  const [step, setStep] = useState<Step>('home');
  const [service, setService] = useState<Service | null>(null);
  const [barber, setBarber] = useState<Barber | null>(null);
  const [date, setDate] = useState(dates[1]);
  const [time, setTime] = useState<string | null>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [view, setView] = useState<'customer' | 'barber'>('customer');

  const progress = useMemo(() => {
    const steps: Step[] = ['service', 'barber', 'time', 'review'];
    const index = steps.indexOf(step);
    return index < 0 ? 0 : ((index + 1) / steps.length) * 100;
  }, [step]);

  const restart = () => {
    setStep('service');
    setService(null);
    setBarber(null);
    setTime(null);
  };

  const confirmBooking = () => {
    if (!service || !barber || !time) return;
    const assignedBarber = barber.id === 'any' ? barbers[1] : barber;
    setAppointment({ service, barber: assignedBarber, date, time });
    setStep('confirmed');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.shell}>
        <View style={styles.topbar}>
          <Pressable onPress={() => { setView('customer'); setStep('home'); }}>
            <Text style={styles.logo}>CUT ME<Text style={styles.logoDot}>.</Text></Text>
          </Pressable>
          <View style={styles.roleSwitch}>
            <RoleButton label="Client" active={view === 'customer'} onPress={() => { setView('customer'); setStep('home'); }} />
            <RoleButton label="Barber" active={view === 'barber'} onPress={() => setView('barber')} />
          </View>
        </View>

        {view === 'customer' && progress > 0 && (
          <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress}%` }]} /></View>
        )}

        <ScrollView contentContainerStyle={[styles.content, width > 760 && styles.contentWide]}>
          {view === 'barber' ? (
            <BarberSchedule appointment={appointment} />
          ) : step === 'home' ? (
            <Home appointment={appointment} onBook={restart} onView={() => setStep('confirmed')} />
          ) : step === 'service' ? (
            <SelectionScreen eyebrow="STEP 1 OF 4" title="Choose your service" subtitle="Select the experience that fits your look.">
              {services.map((item) => <OptionCard key={item.id} selected={service?.id === item.id} onPress={() => setService(item)} title={item.name} subtitle={item.description} meta={`${item.duration} min  ·  $${item.price}`} />)}
              <PrimaryButton label="Choose a barber" disabled={!service} onPress={() => setStep('barber')} />
            </SelectionScreen>
          ) : step === 'barber' ? (
            <SelectionScreen eyebrow="STEP 2 OF 4" title="Choose your barber" subtitle="Pick your preferred professional or get the earliest opening." onBack={() => setStep('service')}>
              <View style={styles.grid}>{barbers.map((item) => <BarberCard key={item.id} barber={item} selected={barber?.id === item.id} onPress={() => setBarber(item)} />)}</View>
              <PrimaryButton label="Choose a time" disabled={!barber} onPress={() => setStep('time')} />
            </SelectionScreen>
          ) : step === 'time' ? (
            <SelectionScreen eyebrow="STEP 3 OF 4" title="Choose a time" subtitle="Only times that fit the complete service are shown." onBack={() => setStep('barber')}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateRow}>
                {dates.map((item) => <Chip key={item} label={item} selected={date === item} onPress={() => { setDate(item); setTime(null); }} />)}
              </ScrollView>
              <View style={styles.timeGrid}>{times.map((item) => <Chip key={item} label={item} selected={time === item} onPress={() => setTime(item)} />)}</View>
              <PrimaryButton label="Review booking" disabled={!time} onPress={() => setStep('review')} />
            </SelectionScreen>
          ) : step === 'review' ? (
            <SelectionScreen eyebrow="STEP 4 OF 4" title="Review your booking" subtitle="Make sure everything looks right." onBack={() => setStep('time')}>
              {service && barber && time && <BookingSummary service={service} barber={barber} date={date} time={time} />}
              <PrimaryButton label="Confirm appointment" onPress={confirmBooking} />
              <Text style={styles.finePrint}>No payment is collected in this first test build.</Text>
            </SelectionScreen>
          ) : (
            <Confirmation appointment={appointment} onDone={() => setStep('home')} />
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function Home({ appointment, onBook, onView }: { appointment: Appointment | null; onBook: () => void; onView: () => void }) {
  return <View style={styles.hero}>
    <Text style={styles.eyebrow}>CLASS A BARBERSHOP</Text>
    <Text style={styles.heroTitle}>Your best cut,{`\n`}without the wait.</Text>
    <Text style={styles.heroCopy}>Book smarter. Look sharper. Choose your service, barber, and exact time in under a minute.</Text>
    <PrimaryButton label="Book an appointment" onPress={onBook} />
    {appointment && <Pressable style={styles.nextCard} onPress={onView}>
      <View><Text style={styles.cardLabel}>YOUR NEXT APPOINTMENT</Text><Text style={styles.nextTitle}>{appointment.date} · {appointment.time}</Text><Text style={styles.muted}>{appointment.service.name} with {appointment.barber.name}</Text></View>
      <Text style={styles.arrow}>›</Text>
    </Pressable>}
    <View style={styles.benefits}><Text style={styles.benefit}>✓ Real-time availability</Text><Text style={styles.benefit}>✓ No phone call needed</Text><Text style={styles.benefit}>✓ Your preferences saved</Text></View>
  </View>;
}

function SelectionScreen({ eyebrow, title, subtitle, children, onBack }: { eyebrow: string; title: string; subtitle: string; children: React.ReactNode; onBack?: () => void }) {
  return <View>{onBack && <Pressable onPress={onBack}><Text style={styles.back}>‹ Back</Text></Pressable>}<Text style={styles.eyebrow}>{eyebrow}</Text><Text style={styles.title}>{title}</Text><Text style={styles.subtitle}>{subtitle}</Text><View style={styles.stack}>{children}</View></View>;
}

function OptionCard({ title, subtitle, meta, selected, onPress }: { title: string; subtitle: string; meta: string; selected: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.option, selected && styles.selected]}><View style={styles.optionCopy}><Text style={styles.optionTitle}>{title}</Text><Text style={styles.muted}>{subtitle}</Text></View><View style={styles.optionRight}><Text style={styles.meta}>{meta}</Text><View style={[styles.radio, selected && styles.radioSelected]}>{selected && <View style={styles.radioCenter} />}</View></View></Pressable>;
}

function BarberCard({ barber, selected, onPress }: { barber: Barber; selected: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.barberCard, selected && styles.selected]}><View style={[styles.avatar, barber.id === 'any' && styles.avatarGold]}><Text style={styles.avatarText}>{barber.initials}</Text></View><Text style={styles.optionTitle}>{barber.name}</Text><Text style={[styles.muted, styles.center]}>{barber.specialty}</Text>{selected && <Text style={styles.selectedText}>SELECTED</Text>}</Pressable>;
}

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}><Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text></Pressable>;
}

function BookingSummary({ service, barber, date, time }: Appointment) {
  return <View style={styles.summary}><SummaryRow label="Service" value={`${service.name} · $${service.price}`} /><SummaryRow label="Barber" value={barber.name} /><SummaryRow label="Date" value={date} /><SummaryRow label="Time" value={`${time} · ${service.duration} min`} /></View>;
}

function SummaryRow({ label, value }: { label: string; value: string }) { return <View style={styles.summaryRow}><Text style={styles.cardLabel}>{label}</Text><Text style={styles.summaryValue}>{value}</Text></View>; }

function Confirmation({ appointment, onDone }: { appointment: Appointment | null; onDone: () => void }) {
  if (!appointment) return null;
  return <View style={styles.confirm}><View style={styles.check}><Text style={styles.checkText}>✓</Text></View><Text style={styles.eyebrow}>APPOINTMENT CONFIRMED</Text><Text style={styles.title}>You're all set.</Text><Text style={styles.subtitle}>We’ll see you at Class A Barbershop.</Text><BookingSummary {...appointment} /><PrimaryButton label="Return home" onPress={onDone} /></View>;
}

function BarberSchedule({ appointment }: { appointment: Appointment | null }) {
  return <View><Text style={styles.eyebrow}>BARBER DASHBOARD</Text><Text style={styles.title}>Good morning, Marcus.</Text><Text style={styles.subtitle}>Here’s your schedule for tomorrow.</Text><View style={styles.stats}><Stat value={appointment ? '1' : '0'} label="Appointments" /><Stat value={appointment ? `$${appointment.service.price}` : '$0'} label="Booked revenue" /><Stat value="0" label="Walk-ins waiting" /></View><Text style={styles.sectionTitle}>Schedule</Text>{appointment ? <View style={styles.scheduleCard}><View style={styles.timeColumn}><Text style={styles.scheduleTime}>{appointment.time}</Text><Text style={styles.muted}>{appointment.service.duration} min</Text></View><View style={styles.scheduleLine} /><View style={styles.optionCopy}><Text style={styles.optionTitle}>New Client</Text><Text style={styles.muted}>{appointment.service.name}</Text><Text style={styles.goldText}>CONFIRMED</Text></View></View> : <View style={styles.empty}><Text style={styles.emptyTitle}>No appointments yet</Text><Text style={styles.muted}>Complete a booking in Client view and it will appear here instantly.</Text></View>}</View>;
}

function Stat({ value, label }: { value: string; label: string }) { return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.cardLabel}>{label}</Text></View>; }
function RoleButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) { return <Pressable onPress={onPress} style={[styles.roleButton, active && styles.roleButtonActive]}><Text style={[styles.roleText, active && styles.roleTextActive]}>{label}</Text></Pressable>; }
function PrimaryButton({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) { return <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.primary, disabled && styles.primaryDisabled, pressed && !disabled && styles.primaryPressed]}><Text style={styles.primaryText}>{label}</Text><Text style={styles.primaryArrow}>→</Text></Pressable>; }

const colors = { ink: '#11100f', paper: '#f5f2eb', white: '#fffdf8', gold: '#c59a54', line: '#d9d3c8', muted: '#6d685f', green: '#1d6b51' };
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.ink }, shell: { flex: 1, backgroundColor: colors.paper },
  topbar: { minHeight: 76, paddingHorizontal: 22, backgroundColor: colors.ink, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logo: { color: colors.white, fontSize: 22, fontWeight: '900', letterSpacing: 2 }, logoDot: { color: colors.gold },
  roleSwitch: { flexDirection: 'row', backgroundColor: '#292724', borderRadius: 22, padding: 3 }, roleButton: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18 }, roleButtonActive: { backgroundColor: colors.gold }, roleText: { color: '#aaa49b', fontSize: 12, fontWeight: '700' }, roleTextActive: { color: colors.ink },
  progressTrack: { height: 3, backgroundColor: '#302e2a' }, progressFill: { height: 3, backgroundColor: colors.gold },
  content: { flexGrow: 1, padding: 22, paddingBottom: 60 }, contentWide: { width: 720, alignSelf: 'center', paddingTop: 52 },
  hero: { flex: 1, justifyContent: 'center', paddingVertical: 32 }, eyebrow: { color: colors.gold, fontWeight: '900', letterSpacing: 1.8, fontSize: 12, marginBottom: 10 }, heroTitle: { color: colors.ink, fontWeight: '900', fontSize: 45, lineHeight: 48, letterSpacing: -1.5, marginBottom: 18 }, heroCopy: { color: colors.muted, fontSize: 17, lineHeight: 26, maxWidth: 560, marginBottom: 24 },
  title: { color: colors.ink, fontWeight: '900', fontSize: 34, letterSpacing: -1, marginBottom: 8 }, subtitle: { color: colors.muted, fontSize: 16, lineHeight: 23, marginBottom: 26 }, stack: { gap: 12 }, back: { color: colors.ink, fontWeight: '800', marginBottom: 24, fontSize: 15 },
  primary: { backgroundColor: colors.ink, minHeight: 58, borderRadius: 8, paddingHorizontal: 20, marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, primaryDisabled: { opacity: 0.3 }, primaryPressed: { opacity: 0.85 }, primaryText: { color: colors.white, fontSize: 15, fontWeight: '900', letterSpacing: 0.5 }, primaryArrow: { color: colors.gold, fontSize: 22 },
  option: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 12 }, selected: { borderColor: colors.gold, borderWidth: 2 }, optionCopy: { flex: 1 }, optionTitle: { color: colors.ink, fontSize: 17, fontWeight: '900', marginBottom: 5 }, optionRight: { alignItems: 'flex-end', gap: 10 }, meta: { color: colors.ink, fontWeight: '800', fontSize: 12 }, muted: { color: colors.muted, fontSize: 13, lineHeight: 18 }, radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' }, radioSelected: { borderColor: colors.gold }, radioCenter: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.gold },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 }, barberCard: { width: '48%', minHeight: 190, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 16, alignItems: 'center', justifyContent: 'center' }, avatar: { width: 58, height: 58, borderRadius: 29, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }, avatarGold: { backgroundColor: colors.gold }, avatarText: { color: colors.white, fontWeight: '900' }, center: { textAlign: 'center' }, selectedText: { color: colors.gold, fontSize: 10, fontWeight: '900', letterSpacing: 1, marginTop: 10 },
  dateRow: { gap: 8, paddingBottom: 14 }, timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, chip: { minWidth: 98, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, borderRadius: 7, paddingVertical: 14, paddingHorizontal: 14, alignItems: 'center' }, chipSelected: { backgroundColor: colors.ink, borderColor: colors.ink }, chipText: { color: colors.ink, fontWeight: '800', fontSize: 13 }, chipTextSelected: { color: colors.white },
  summary: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 10, paddingHorizontal: 18 }, summaryRow: { paddingVertical: 17, borderBottomWidth: 1, borderBottomColor: colors.line }, cardLabel: { color: colors.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1.1, marginBottom: 4 }, summaryValue: { color: colors.ink, fontSize: 16, fontWeight: '800' }, finePrint: { textAlign: 'center', color: colors.muted, fontSize: 11, marginTop: 2 },
  confirm: { alignItems: 'stretch', paddingTop: 22 }, check: { width: 68, height: 68, borderRadius: 34, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center', marginBottom: 22 }, checkText: { color: colors.white, fontSize: 34, fontWeight: '900' },
  nextCard: { marginTop: 22, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, nextTitle: { fontSize: 17, color: colors.ink, fontWeight: '900', marginBottom: 3 }, arrow: { color: colors.gold, fontSize: 30 }, benefits: { gap: 9, marginTop: 24 }, benefit: { color: colors.muted, fontSize: 13, fontWeight: '700' },
  stats: { flexDirection: 'row', gap: 8, marginBottom: 30 }, stat: { flex: 1, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 9, padding: 14 }, statValue: { fontSize: 22, fontWeight: '900', color: colors.ink, marginBottom: 6 }, sectionTitle: { fontSize: 21, fontWeight: '900', color: colors.ink, marginBottom: 12 }, scheduleCard: { flexDirection: 'row', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 18 }, timeColumn: { width: 82 }, scheduleTime: { fontWeight: '900', fontSize: 14, color: colors.ink }, scheduleLine: { width: 3, backgroundColor: colors.gold, marginRight: 16, borderRadius: 2 }, goldText: { color: colors.gold, fontSize: 10, fontWeight: '900', letterSpacing: 1, marginTop: 7 }, empty: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 28, alignItems: 'center' }, emptyTitle: { fontSize: 17, fontWeight: '900', marginBottom: 6, color: colors.ink },
});
