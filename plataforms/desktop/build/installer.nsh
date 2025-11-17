!include "MUI2.nsh"

;--------------------------------
; Define custom installer pages
;--------------------------------

!define MUI_WELCOMEPAGE_TITLE "Welcome to Game Engine TS Setup"
!define MUI_WELCOMEPAGE_TEXT "Thank you for choosing Game Engine TS! This wizard will guide you through the installation."
!insertmacro MUI_PAGE_WELCOME

!insertmacro MUI_PAGE_LICENSE "${BUILD_RESOURCES_DIR}/license.txt"

!insertmacro MUI_PAGE_DIRECTORY

!insertmacro MUI_PAGE_INSTFILES

!define MUI_FINISHPAGE_RUN "$INSTDIR\Game Engine TS.exe"
!insertmacro MUI_PAGE_FINISH

;--------------------------------
; Set installer attributes and sections
;--------------------------------

Section "Install"
  SetOutPath "$INSTDIR"
  
  ; Cria o desinstalador na pasta de instalação.
  WriteUninstaller "$INSTDIR\uninstall.exe"
  
  ; Criação do atalho na área de trabalho (nome consistente)
  CreateShortcut "$DESKTOP\Game Engine TS.lnk" "$INSTDIR\Game Engine TS.exe"

  ; Criação do atalho no Menu Iniciar (nome consistente)
  CreateDirectory "$SMPROGRAMS\Game Engine TS"
  CreateShortcut "$SMPROGRAMS\Game Engine TS\Game Engine TS.lnk" "$INSTDIR\Game Engine TS.exe"

SectionEnd

;--------------------------------
; Uninstaller
;--------------------------------

Section "Uninstall"
  ; Remove os atalhos com os nomes corretos
  Delete "$DESKTOP\Game Engine TS.lnk"
  Delete "$SMPROGRAMS\Game Engine TS\Game Engine TS.lnk"
  
  ; Remove a pasta do Menu Iniciar
  RMDir "$SMPROGRAMS\Game Engine TS"

  ; Esta linha remove todos os arquivos da pasta de instalação.
  RMDir /r "$INSTDIR"
SectionEnd