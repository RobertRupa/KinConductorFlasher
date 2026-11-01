"use strict";
window.KinI18n = (() => {
  const strings = {
    en: {
      project:"Project ↗",headline:"Directly from your browser.",intro:"Factory installer for KinConductor KC868 controllers. Requires desktop Chrome or Edge, USB and HTTPS.",
      selectDevice:"Select device",firmwareProfile:"Firmware profile",version:"Version",loading:"Loading releases…",
      alias:"Warning: A6 pin-map alias. This profile has not been electrically validated for the selected board.",
      factory:"Factory installation",destructive:"This operation may erase settings!",
      factoryInfo:"The factory image writes from 0x0, including NVS and OTA metadata. The installer also writes LittleFS at 0x310000. This is not a configuration-preserving update.",
      confirm:"I backed up my settings, verified the board and disconnected unsafe relay loads.",
      install:"Connect and install",unsupported:"Web Serial is unavailable. Use desktop Chrome or Edge.",
      notAllowed:"HTTPS or localhost is required.",boot:"If necessary, hold BOOT while resetting to enter flashing mode. Do not disconnect USB while flashing.",
      update:"Update without erasing settings",
      updateInfo:"For routine updates, use the supported OTA method or PlatformIO with matching firmware.bin and littlefs.bin files. Writing the application at 0x10000 does not guarantee an update to the active OTA slot.",
      download:"Firmware and release notes ↗",
      unavailable:"No verified firmware image is available for this profile.",remaining:"OTA space remaining",latest:"latest",
      fetchError:"Firmware release unavailable: "
    },
    pl: {
      project:"Projekt ↗",headline:"Prosto z przeglądarki.",intro:"Instalator fabryczny KinConductor dla kontrolerów KC868. Wymaga Chrome lub Edge na komputerze, połączenia USB i HTTPS.",
      selectDevice:"Wybierz urządzenie",firmwareProfile:"Profil firmware",version:"Wersja",loading:"Ładowanie wersji…",
      alias:"Uwaga: alias mapy pinów A6. Ten profil nie został elektrycznie zweryfikowany na wybranej płycie.",
      factory:"Instalacja fabryczna",destructive:"Ta operacja może usunąć ustawienia!",
      factoryInfo:"Obraz fabryczny zapisuje obszar od 0x0, w tym NVS i metadane OTA. Instalator zapisze także LittleFS od 0x310000. Nie jest to aktualizacja zachowująca konfigurację.",
      confirm:"Zrobiłem kopię ustawień, sprawdziłem model i odłączyłem niebezpieczne obciążenia przekaźników.",
      install:"Połącz i zainstaluj",unsupported:"Web Serial niedostępny. Otwórz Chrome lub Edge na komputerze.",
      notAllowed:"Wymagane HTTPS lub localhost.",boot:"W razie potrzeby przytrzymaj BOOT podczas resetu, aby wejść w tryb flash. Nie odłączaj USB w trakcie zapisu.",
      update:"Aktualizacja bez kasowania konfiguracji",
      updateInfo:"Do rutynowych aktualizacji korzystaj z obsługiwanej ścieżki OTA lub PlatformIO oraz odpowiadających sobie plików firmware.bin i littlefs.bin. Samo zapisanie aplikacji pod 0x10000 nie gwarantuje aktualizacji aktywnego slotu OTA.",
      download:"Firmware i dokumentacja wydań ↗",
      unavailable:"Brak zweryfikowanego obrazu dla wybranego profilu.",remaining:"pozostało w OTA",latest:"najnowsza",
      fetchError:"Publikacja firmware niedostępna: "
    }
  };
  let lang = "en";
  try { if (localStorage.getItem("kinconductor-language") === "pl") lang = "pl"; } catch (_) {}
  const params = new URLSearchParams(location.search);
  if (["en","pl"].includes(params.get("lang"))) lang = params.get("lang");
  const t = key => strings[lang][key] ?? strings.en[key] ?? key;
  const listeners = new Set();
  function render() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
    const selector=document.getElementById("language");
    if(selector) selector.value=lang;
    listeners.forEach(callback => callback());
  }
  function setLanguage(value) {
    if(!strings[value]) return;
    lang=value;
    try {localStorage.setItem("kinconductor-language",value);}catch(_){}
    render();
  }
  document.addEventListener("DOMContentLoaded",()=> {
    document.getElementById("language")?.addEventListener("change",event=>setLanguage(event.target.value));
    render();
  });
  return {t,render,setLanguage,onChange:callback=>listeners.add(callback),get language(){return lang;}};
})();
