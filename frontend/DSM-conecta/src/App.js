import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const navItems = ['Tela inicial', 'Grade curricular', 'Sobre nós', 'Formulário', 'Contato'];

const screenContent = {
  'Tela inicial': {
    paragraph:
      'O curso de Desenvolvimento de Software Multiplataforma (DSM) prepara profissionais para atuar no desenvolvimento de aplicações web, mobile e sistemas de software. Durante a formação, os alunos aprendem programação, banco de dados, desenvolvimento web, engenharia de software e outras tecnologias utilizadas no mercado. O curso também busca desenvolver habilidades práticas por meio de projetos, preparando os estudantes para compreender diferentes etapas do desenvolvimento de uma aplicação e trabalhar com soluções tecnológicas para diferentes necessidades.',
    image: true,
    type: 'home',
  },
  'Grade curricular': {
    leftTitle: 'MATÉRIAS',
    leftItems: [
      'Algoritmo e Lógica de Programação',
      'Modelagem de Banco de Dados',
      'Sistemas Operacionais e Redes de Computadores',
      'Design Digital',
      'Engenharia de Software I',
      'Desenvolvimento Web I',
      'Matemática para Computação',
    ],
    rightTitle: 'CURSOS PREPARATÓRIOS',
    rightItems: ['Aprova Fatec', 'Vestec', 'Estratégia Vestibulares'],
    type: 'duo-column',
  },
  'Sobre nós': {
    leftTitle: 'CITAR A EQUIPE',
    leftItems: ['LUCAS BOY', 'DENI', 'EMANUELY', 'VITORIA', 'WELBER'],
    rightTitle: 'CITAR A EQUIPE',
    rightItems: ['GENIO DA BOLA', 'DOCUMENTADORA.', 'PROGRAMADORA.', 'APOIO MORAL.', 'MENTE POR TRÁS DE TUDO.'],
    type: 'duo-column',
  },
  'Formulário': {
    paragraph:
      'Acesse o formulário para entrar em contato com a instituição, tirar dúvidas sobre matrícula, bolsas e demais informações sobre o curso.',
    image: false,
    type: 'text',
  },
  Contato: {
    paragraph:
      'E-mail: contato@fateczonasul.edu.br\nTelefone: (11) 0000-0000\nEndereço: Avenida ..., São Paulo - SP',
    image: false,
    type: 'text',
  },
};

export default function App() {
  const [activeTab, setActiveTab] = useState('Tela inicial');
  const currentScreen = screenContent[activeTab];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageWrapper}>
          <View style={styles.header}>
            <View style={styles.instituicao}>
              <Text style={styles.instituicaoTitle}>Fatec Zona Sul</Text>
              <Text style={styles.instituicaoSubtitle}>Dom Paulo Evaristo Arns</Text>
            </View>

            <View style={styles.cursoBox}>
              <Text style={styles.cursoTitle}>Desenvolvimento de Software Multiplataforma</Text>
            </View>
          </View>

          <View style={styles.navbar}>
            {navItems.map((item) => {
              const isActive = item === activeTab;

              return (
                <Pressable
                  key={item}
                  onPress={() => setActiveTab(item)}
                  style={[styles.navItem, isActive && styles.navItemActive]}
                >
                  <Text style={styles.navText}>{item}</Text>
                </Pressable>
              );
            })}
          </View>

          {currentScreen.type === 'home' && (
            <View style={styles.homeRow}>
              <View style={styles.textoContainer}>
                <Text style={styles.paragraph}>{currentScreen.paragraph}</Text>
              </View>

              <Image
                source={require('../assets/imgs/Fatec_zona_sul.jpg')}
                style={styles.imagemFatec}
                resizeMode="cover"
              />
            </View>
          )}

          {currentScreen.type === 'text' && (
            <View style={styles.apresentacao}>
              <Text style={styles.paragraph}>{currentScreen.paragraph}</Text>
            </View>
          )}

          {currentScreen.type === 'duo-column' && (
            <View style={styles.dualColumnSection}>
              <View style={styles.columnLeft}>
                <Text style={styles.sectionLabel}>{currentScreen.leftTitle}</Text>
                {currentScreen.leftItems.map((item) => (
                  <Text key={item} style={styles.listItem}>{item}</Text>
                ))}
              </View>

              <View style={styles.columnRight}>
                <Text style={styles.sectionLabel}>{currentScreen.rightTitle}</Text>
                {currentScreen.rightItems.map((item) => (
                  <Text key={item} style={styles.listItemMini}>{item}</Text>
                ))}
              </View>
            </View>
          )}

          {activeTab === 'Tela inicial' && (
            <View style={styles.parcerias}>
              <Text style={styles.parceriasText}>PARCEIROS FATEC</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1d1d1d',
  },
  content: {
    paddingTop: 18,
    paddingBottom: 24,
  },
  pageWrapper: {
    width: '100%',
    maxWidth: 1280,
    alignSelf: 'center',
    paddingHorizontal: 14,
  },
  header: {
    marginBottom: 12,
  },
  instituicao: {
    marginBottom: 8,
  },
  instituicaoTitle: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 36,
  },
  instituicaoSubtitle: {
    color: '#fff',
    fontSize: 18,
    lineHeight: 26,
    marginTop: 2,
  },
  cursoBox: {
    marginTop: 2,
  },
  cursoTitle: {
    color: '#fff',
    fontSize: 25,
    fontWeight: '600',
    lineHeight: 32,
  },
  navbar: {
    backgroundColor: '#392c9e',
    borderRadius: 18,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    minHeight: 46,
    marginTop: 8,
  },
  navItem: {
    flex: 1,
    minHeight: 46,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  navItemActive: {
    backgroundColor: '#4c3dba',
  },
  navText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  homeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 16,
    gap: 18,
  },
  textoContainer: {
    flex: 1,
    maxWidth: '58%',
  },
  apresentacao: {
    marginTop: 24,
    marginBottom: 16,
  },
  paragraph: {
    color: '#fff',
    fontSize: 17,
    lineHeight: 29,
    textAlign: 'left',
  },
  imagemFatec: {
    width: '45%',
    aspectRatio: 16 / 9,
    backgroundColor: '#d9d9d9',
    borderRadius: 4,
  },
  dualColumnSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 24,
    marginBottom: 16,
    minHeight: 420,
  },
  columnLeft: {
    width: '48%',
    alignItems: 'flex-start',
  },
  columnRight: {
    width: '48%',
    alignItems: 'flex-start',
    marginTop: 110,
  },
  sectionLabel: {
    backgroundColor: '#d9d9d9',
    color: '#000',
    fontSize: 13,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 10,
    fontWeight: '400',
  },
  listItem: {
    backgroundColor: '#d9d9d9',
    color: '#000',
    fontSize: 14,
    lineHeight: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 7,
    width: '80%',
  },
  listItemMini: {
    backgroundColor: '#d9d9d9',
    color: '#000',
    fontSize: 12,
    lineHeight: 18,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 7,
    width: '85%',
  },
  parcerias: {
    marginTop: 20,
    backgroundColor: '#d9d9d9',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  parceriasText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
