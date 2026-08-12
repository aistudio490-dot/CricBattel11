
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert, StyleSheet, Modal } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RewardedAd, TestIds, RewardedAdEventType } from 'react-native-google-mobile-ads';

// --- CONFIGURATION ---
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const ADMIN_EMAIL = 'chadkrishnakumar464@gmail.com';
const rewardAdUnitId = __DEV__ ? TestIds.REWARDED : 'your-admob-unit-id';

const Stack = createStackNavigator();

// --- UTILS & ENGINE ---
const calculateTDS = (amount, rate) => (amount * (rate / 100)).toFixed(2);

// --- SCREENS ---

// 1. Home Screen (Match List)
const HomeScreen = ({ navigation }) => {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    const { data } = await supabase.from('matches').select('*').eq('status', 'upcoming');
    setMatches(data || []);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}><Text style={styles.headerText}>CricBattle 11</Text></View>
      {matches.map(match => (
        <TouchableOpacity key={match.id} style={styles.matchCard} onPress={() => navigation.navigate('Contests', { match })}>
          <Text style={styles.matchTeams}>{match.team_a} vs {match.team_b}</Text>
          <Text style={styles.matchTime}>{new Date(match.start_time).toLocaleString()}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={styles.adminBtn} onPress={() => navigation.navigate('AdminAuth')}>
        <Text style={{color: '#fff'}}>Admin Access</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// 2. Contest Join & Ad Logic
const ContestScreen = ({ route }) => {
  const { match } = route.params;
  const [contests, setContests] = useState([
    { id: '1', fee: 25, slots: 25000, filled: 12500 },
    { id: '2', fee: 50, slots: 50000, filled: 30000 },
    { id: '3', fee: 100, slots: 100000, filled: 55000 }
  ]);

  const handleJoin = (contest) => {
    const rewarded = RewardedAd.createForAdRequest(rewardAdUnitId);
    rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      Alert.alert("Success", `Joined ₹${contest.fee} Contest! Bot fill active.`);
      // Logic for Auto-replenish: if(filled == slots) { spawnNew() }
    });
    rewarded.load();
    rewarded.show();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.subHeader}>Winner Takes All Contests</Text>
      {contests.map(c => (
        <View key={c.id} style={styles.contestCard}>
          <Text style={styles.entryFee}>Entry: ₹{c.fee}</Text>
          <Text>Prize: Winner Takes All!</Text>
          <TouchableOpacity style={styles.joinBtn} onPress={() => handleJoin(c)}>
            <Text style={styles.joinText}>JOIN</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

// 3. Admin Panel with Passcode Security
const AdminDashboard = () => {
  const [passcode, setPasscode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [tds, setTds] = useState(20);

  const checkPasscode = () => {
    if (passcode.length >= 10 && passcode === "MASTER_ADMIN_786") { // Example Passcode
      setIsUnlocked(true);
    } else {
      Alert.alert("Error", "Invalid Security Passcode");
    }
  };

  if (!isUnlocked) {
    return (
      <View style={styles.centered}>
        <TextInput 
          secureTextEntry 
          placeholder="10-12 Char Passcode" 
          style={styles.input} 
          onChangeText={setPasscode}
        />
        <TouchableOpacity style={styles.btn} onPress={checkPasscode}>
          <Text style={{color: '#fff'}}>Unlock Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerText}>Admin Control (TDS: {tds}%)</Text>
      <TextInput placeholder="Paste Squad JSON" multiline style={styles.textArea} />
      <TouchableOpacity style={styles.btn}><Text style={{color:'#white'}}>Launch New Match</Text></TouchableOpacity>
      
      <View style={styles.payoutCard}>
        <Text>Withdrawal Request: ₹500</Text>
        <Text>TDS (20%): ₹100 | Payable: ₹400</Text>
        <TouchableOpacity style={styles.approveBtn}><Text>Approve Payout</Text></TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4', padding: 15 },
  header: { padding: 20, backgroundColor: '#1a1a1a', borderRadius: 10, marginBottom: 20 },
  headerText: { color: '#FFD700', fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  matchCard: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 3 },
  matchTeams: { fontSize: 18, fontWeight: 'bold' },
  matchTime: { color: 'red', marginTop: 5 },
  contestCard: { backgroundColor: '#fff', padding: 20, borderRadius: 10, marginBottom: 15, borderLeftWidth: 5, borderLeftColor: '#FFD700' },
  joinBtn: { backgroundColor: '#28a745', padding: 10, borderRadius: 5, marginTop: 10, alignItems: 'center' },
  joinText: { color: '#fff', fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 15, borderRadius: 10, width: '80%', marginBottom: 10 },
  btn: { backgroundColor: '#000', padding: 15, borderRadius: 10, width: '80%', alignItems: 'center' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  textArea: { backgroundColor: '#fff', height: 100, borderRadius: 10, padding: 10, marginBottom: 10 },
  adminBtn: { marginTop: 50, alignSelf: 'center', padding: 10, backgroundColor: '#333', borderRadius: 5 },
  payoutCard: { backgroundColor: '#fff', padding: 15, marginTop: 20, borderRadius: 10, borderLeftWidth: 5, borderLeftColor: 'blue' },
  approveBtn: { backgroundColor: '#FFD700', padding: 10, marginTop: 10, borderRadius: 5 }
});

// --- NAVIGATION ---
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'CricBattle 11' }} />
        <Stack.Screen name="Contests" component={ContestScreen} />
        <Stack.Screen name="AdminAuth" component={AdminDashboard} options={{ title: 'Secure Admin' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
      }
