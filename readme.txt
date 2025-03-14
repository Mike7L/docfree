2. USER: Ultimate Prompt for Maximum Accuracy, Zero Assumptions, and Smart Use of Provided Content
Task Execution Rules (Non-Negotiable):
Absolute Document & Code Reliance
🔍 Always analyze the provided documents or code before answering.
✅ Every claim must reference the exact document name, section, page, clause, or code snippet when available.
❌ Never rely on pre-trained knowledge if relevant information is provided.

Step-by-Step Cross-Referencing
For complex queries, break them down into sub-questions and verify consistency across all provided materials.
⚠️ If contradictions exist, explicitly highlight them instead of assuming a correct interpretation.

No Assumptions or Guesswork
🚫 Do not "fill in the gaps" with extrapolations or logical deductions unless explicitly requested.
🤝 If a gap exists, state clearly:
"This information is not defined in the provided sources."

Fact-Checking Across Multiple Sources
🎯 Ensure consistency between all provided documents, files, or code snippets.
⚠️ If inconsistencies exist, flag them instead of arbitrarily resolving them.

Precision in Responses (Legal, Technical, or Code-Related)
📜 Use exact terminology from the documents or code. Only paraphrase when explicitly requested.
💻 For code analysis, ensure functionality, efficiency, and adherence to best practices based on provided specifications.

Smart Use of Pretrained Knowledge (Only When Necessary!)
🧠 Use pre-trained knowledge only if:
a) The issue should be covered in the documents but isn’t.
b) The provided information conflicts with well-established technical, legal, or coding norms.

⚠️ However: Any assumption must be clearly labeled!
✅ If making an educated guess, state explicitly:
"This is an assumption based on general industry standards, as the provided documents do not specify it."
"This differs from commonly accepted norms. Please verify before proceeding."

Error-Proof Your Output
🔁 Before submitting a response, ensure:

Every claim is backed by the provided materials.
No assumptions are hidden as facts.
Clarifications are requested instead of improvisation.
Final Rule (From Human Intelligence):
🚨 “Assumption is the mother of all mistakes.”
Be precise, thorough, and factual—but never bullshit the user.

3. GPT: Got it. I'll ensure maximum accuracy by referencing the uploaded documents and code snippets explicitly. Let me know what you need analyzed, modified, or explained, and I will reference the exact sections, pages, or code blocks to support my response.

4. USER: OnInitAll
	{DO.NotAus1}=1 ; kein Not-Aus von imc
	{DO.NotAus2}=1
	DV_NotAus_CMD=0 ;UI CMD zum ansteuern von DOs
	
;DEL: ;<< ************ CANopen Botschaften VPC ************************
CanMsgNMT=CANMsg()
CanMsgSYNC=CANMsg()
;************ CANopen Steuer-Variablen Init *********
pv.NMTall=1 ;0x81 ; Reset Node (Restart Nanotec) des NMT Services
;<< Manueller Modus - STEUERUNG
pv.LR_ManBewAktiv=0 ;wenn 1-Bewegung
pv.LR_ManBewRichtung=1 ;bestimmt die Richtung
pv.LR_inRegelung =0 ; 0=nicht geregelt
pv.LR_Man_LimitKraft=0.5 ;in kN
pv.LR_ManGeschwSetpoint=5  ; mm/s
pv.LR_ManWegSetpoint=0  ; mm
;>>
;<<	GLOBALE OP MODI
	pv.Global_OP_Mode=0
	(*
	0=init
	1=Manuell
	2=AutoTest
	5=PID Tune Z	*)
	
	;AO nullen
	CMD_Auflast=0
	
	;MANUELLER MODUS
	;pv.ManMode.LimitKraft_z =0.05 ;in kN
	;pv.ManMode.SpeedCMD_z =0.1 ;mm/s
	pv.ManMode.Richtung_z =0 ;1=runter -1=hoch
	
	{DV_ManMode.WegInkrement}=1 ; in mm
	
	(*
	MODI
	0=AUS
	1=OpenLoop Speed Sollwert Sinus
	2=CL nach Weg extern Sinus
	3=CL nach Kraft Sinus
	4=CL nach Dehnung
	5=CL nach Spannung
	*)
	pv.ModeFB_z=0
;>>	
	
;<< SINUS Manuell Params
	float Pi = 3.141592653589
	{DV_Tune.Ampl1}=1
	{DV_Tune.Freq1}=1
	{DV_Tune.MidValue}=0
;>>
	
;<< REGLER
pv.SyncCycle = 0.002 ; in s ->	500 Hz
; Finale Werte für Regler ggf. inkl. ADAPT
pv.PIDz.P	=1	
pv.PIDz.I	=1	
pv.PIDz.V	=0	
pv.PIDz.FFWD_Phase	=0 ; in Degree
pv.PIDz.FFWD_Coef=0
; Basis-Glieder für KRAFT-Regelung		
RESTORE pv.PIDz.P_F	=5	
RESTORE pv.PIDz.I_F	=2
; Basis-Glieder für WEG-Regelung
RESTORE pv.PIDz.P_s	=20	
RESTORE pv.PIDz.I_s	=15	
; Umrechnungsfaktoren für PID Werte 
; aus Kraft in kN zu Spannung in kPa
; aus Weg in mm zu Dehnung in %
float hub_strain_coeff =1
float kraft_stress_coeff =0.007
;Regler anlegen
	
	;Regler Z-Achse
	Ct_Z = CtPID(1, 1, 0)
	Ct_Z.COMin=-100 ; mm/s
	Ct_Z.COMax=100 ; mm/s
	Ct_Z.CODefault=0
	Ct_Z.SetPoint=0
	Ct_Z.Reset=1
	Ct_Z.KV =0 
	Ct_Z.xInput=0; Vorsteuerung KV als [(mm/s)/kN] * Sollwert [kN] 
	
	;Universelle Soll- und Istwerte für Regler
	pv.Sollwert_z=0
	pv.Istwert_z=0
	;berechnete CMDs / Stellwerte
	pv.CMD_z =0
;<< ADAPT
pv.Sollwert.z_Diff=0
; für ADAPT Berechnung verwendete PVs aus Kanälen
pv.Error_Sollist_z_dot =0
; lokale Min/Max für 1 Sinus Periode
float sin_z_SollMax =0
float sin_z_SollMin =0
float sin_z_IstMax =0
float sin_z_IstMin =0
float sin_z_ErrorSpan_temp =1 ;je Periode
float var_sin_z_ErrorSpan =1
; ADAPT Params z	
RESTORE pv.PIDz.Pgain_F	=0.2
RESTORE pv.PIDz.Igain_Errdot_F 	=0.5
RESTORE pv.PIDz.Pgain_s	=10
RESTORE pv.PIDz.Igain_Errdot_s 	=0.5
; Limits für ADAPTives P
float PIDz_P_lim =80
; P temporäre Werte bei periodischer Anpassung
float PIDz.P_temp=0
float PIDz.P_add=0
; Anpassung Vorsteuersignal in Kraftmodus
float sin_z_Stellw_FFWD_coeff =1 ;Wert für Korrektur steilheitsbegrenzt
float sin_z_Stellw_FFWD_temp =1 ;online Berechnung
float Max_Stellw_FFWD_coeff =500
float Min_Stellw_FFWD_coeff =0.0001
float Max_Avrg_Stiffness = 20 ; kN/mm
float Min_Avrg_Stiffness = 0.01 ; kN/mm
; bei Erreichen d Werte wird Steifigkeits-Adapt Zyklus ausgelöst
float threshold_hub_int=2 ; in mm
float threshold_kraft_int=2 ; in kN
;<< LIMITS
	
	RESTORE pv.Lim.HubZ_min=-50 ;mm
	RESTORE pv.Lim.HubZ_max=50 ;mm
	
	RESTORE pv.Lim.setzung_min=-1 ;mm
	RESTORE pv.Lim.setzung_max=20 ;mm
			
	RESTORE pv.Lim.KraftZ_min=-5 ;kN
	RESTORE pv.Lim.KraftZ_max=10 ;kN
	
	RESTORE pv.Lim.StressRadEff_Up	=4000 ; in kPa
	RESTORE pv.Lim.StressRadEff_Down	=-1
	
	RESTORE pv.Lim.q_deviator_Up	=4000 ; in kPa
	RESTORE pv.Lim.q_deviator_Down	=0
		
	pv.Lim.CANopen_Off =1 ; für Heartbeat Ersatzwert "999" bei 1 sec time-out
	pv.Lim.Error_Off =1 ; für zustände "Fault"  & "Fault Reaction"
	pv.Lim.QuickStop_Off =1 ; QuickStop (auch Endlage)
	
	pv.Lim.AllSoft_Off =1 ; Aktivieren von allen Soft-Grenzwerten nur bei Auto-Test und PID tune
;>>
;<< PHASEN Dienst- und Steuerparameter
pv.Phase_Now=0
pv.Phase_Next =1
pv.NextPhase_Type = 0 ;von welchem Typ die nächste Phase ist.
pv.Phase_Next_CMD=1
pv.PauseNach =0 ; Pause nach der Phase
pv.Phasendauer_Cache=0  
pv.Phasendauer=0
;>>
;<< SETUP SYSTEM
(*
pv.Setup.Z_Speed_ini =1 ; mm/s
pv.Setup.Z_Stress_ini =10 ; kPa
pv.Setup.FadeInOut_time =3 ; s
pv.Setup.UnloadAll_time =60 ;s *)
Restore pv.Setup.A_alr=200 ; Fläche der Kontaktfläche Kraftsensor-Probe, wo kein Zellendruck axiale Kraft verursacht in mm²
Restore pv.Setup.Force_FB_select=1;1=external, 2=internal_small, 3=internal_big
Restore pv.Setup.Sample_AreaCalc=1; 1=cylindrical, 2=barrel
Restore pv.Setup.StrainCalc_select=1 ; 1=engineering, 2=logarithmic
Restore pv.Setup.StrainSensor_select=1 ; 1=zylinder, 2=extern
pv.Setzung_FB =0 ; für Regelung bei Dehnung
Restore pv.setzung_FB_Offset =0
;>>
;<< SETUP PROBE
RESTORE pv.Probe.H_ini =25 ;mm
RESTORE pv.Probe.D_ini =100 ;mm
pv.Probe.A_ini =7600 ;mm³ - wird gerechnet
pv.Probe.V_ini =76000 ; mm³
pv.Probe.A_mean =0
pv.D_h_2 =0
pv.D_h_3 =0
;>>
;<< MESSWERTE
pv.Probe.Hoehe =0  ; in mm
pv.Probe.Volumen=0 ; in mm³
pv.F_axial =0
pv.Strain_axial =0
pv.Strain_Probe_radial =0
pv.Strain_Probe_axial =0
pv.Sigma_Axial =0
pv.Sigma_axial_eff =0
pv.Sigma_radial_eff =0
pv.p_mean_eff_stress =0
pv.q_deviatoric_stress =0
;Max Stress_z für Phasenparameter
pv.Sigma_Axial_max =0 ;finaler Wert über alle Phasen
float Stress_z_max =0 ;Wert je Phase
;>>
;<< TESTABLAUF / Setpoint von Tabelle
pv.SetP_ResetAll =0
;Axle1 = z-Achse
pv.SetP_Axle1.mode	=0
pv.SetP_Axle1.shape	=0
pv.SetP_Axle1.ampl	=0
pv.SetP_Axle1.midvalue	=0
pv.SetP_Axle1.midvalue_current_value =0
pv.SetP_Axle1.phasenr	=0
pv.SetP_Axle1.freq	=0
pv.SetP_Axle1.rate	=0
pv.SetP_Axle1.springconst	=0
pv.SetP_Axle1.PShift1 =0
pv.SetP_Axle1.PShift2 =0
pv.SetP_Axle1.ampl2 =0
pv.SetP_Axle1.freq2 =0
;Stop Criteria
pv.Criteria1.Type =0
pv.Criteria1.Value =0
pv.Criteria2.Type =0
pv.Criteria2.Value =0
pv.Criteria3.Type =0
pv.Criteria3.Value =0
pv.Criteria.Bool =1 ; 1= OR; 2= AND all
;Script - imc Communication
pv.PhaseConfig.Trigger =0 
(*
ini / C# Script not active	0	imc / ini or all data received
imc requests data for new phase	10	imc / imc needs phase data		
C# can't send any data	19	C# / negative answer to "10"		
C# did send data sucessfully	11	C# / positive answer to "10"		
C# Script not active	0	imc / positive answer to "11"		*)
pv.PhaseConfig.Qty =0 ; quantity of fully defined phases
;>>
;<< SINUS GENERATOR PARAMS
; Einmaliges Sin Parametrieren
int index_sin_z=0
; Sin Inkrement = 2*Pi*f*SyncCycle
float sin_inkrement.z1 =0
; Perioden-Counter
int sin_Counter.z1=0
; PVs
pv.Sin_z.CycleCount =0
pv.Error_SollIst_z =0
pv.Sin_z.AvrgStiffness =5
pv.SoftRamp =0 ; 
pv.SoftRampTime =3
float sin_z_CMDoffset_temp=0
float sin_z_CMDoffset =0
;>>
;<< RAMPE GENERATOR PARAMS
; Einmaliges Rampen Parametrieren
int index_ramp_z=0
pv.Ramp_z.Startwert =0
pv.Ramp_z.Endwert =0
int Reset_Integral_z =0
int Counter_z=0
float Hubz_temp =0
float Kraftz_temp =0
float CMDz_temp =0
float Vz_temp =0
float Sollz_temp =0
float Istz_temp =0
float Var_Error_z =1
;>>
;<< Virt. Spring PARAMS
float Kraft_z_spring0 =0
float Hub_z_spring0 =0
;>>
;<< Phasendauer
; Zeitvariablen 
pv.Phasendauer_Cache=0  
pv.Phasendauer=0
pv.time_Month=0
pv.time_Day=0
pv.time_Hour=0
pv.time_Minute=0
pv.time_Second=0
pv.timeN_Second=0
pv.timeN_Minute=0
pv.timeN_Hour=0
pv.timeN_Day=0
pv.timeN_Month=0
;>>
;<< Hydraulik
;int Counter_Hydraulic = 1
; SAFETY & HPU CMDs
{DO.NotAus1}=1
{DO.NotAus2}=1
{CMD.HighPressure_ON} =0
{CMD.LowPressure_ON} =0
VB_Hydraulics_On =0 ; kumulierter VB für Hydraulik
; statische Wegregelung
VB_Setpoint_Static_LR_CMD =0 
int Counter_SetpLR=0 ; bei Eintritt in stat. Wegregelung einmalig Sollwert schreiben
;>>
End
OnTriggerMeasure(Trigger_48)
	
;<< ******* Hydraulik-Status *****
;FB bei LowP d.h. Pumpe läuft
State_Hydraulic_pump = Antrieb_Weg_Z_mon*0 + State.Hydraulic_pump_OK
;FB dass Motor der Pumpe läuft. Hat RESTDRUCK!
State_Hydraulic_drive = Antrieb_Weg_Z_mon*0 + State.Hydraulic_drive_running
; läuft auch wenn der Motor läuft
if State_Hydraulic_pump=1 OR State_Hydraulic_drive=1 
	VB_Hydraulics_On=1
End
if VB_Hydraulics_On=1 AND State_Hydraulic_drive=0 ;Motor aus -> abschalten Regler
	VB_Hydraulics_On=0
	pv.CMD_z=0
		
End
;>>
;<< ******* Not Aus übertragen *******
if DV_NotAus_CMD=1 ; ausgelöst
	{DO.NotAus1}=0 ; Not-Aus von imc
	{DO.NotAus2}=0
	DV_NotAus_CMD=0
	Else
	{DO.NotAus1}=1 ; kein Not-Aus von imc
	{DO.NotAus2}=1
	End	
;>>
;<< ******* MESSWERTE *******
;<< Setzung Select
	Switch pv.Setup.StrainSensor_select
		Case 1 ; Zylinder
		pv.Setzung_FB = pv.Antrieb_Weg_Z - pv.setzung_FB_Offset
		End
		Case 2 ; externe Setzung
		pv.Setzung_FB = pv.Setzung1 - pv.setzung_FB_Offset
		End
	End
;>>
;<< GEOMETRIE der Probe
pv.Probe.A_ini = Pi * (pv.Probe.D_ini/2)^2 ; in mm²
pv.Probe.Hoehe = pv.Probe.H_ini - pv.Setzung_FB ; bei Bew. nach unten wird Setzung großer werden und Probenhhe kleiner
; VOLUMEN der Probe
pv.Probe.V_ini= pv.Probe.H_ini * pv.Probe.A_ini ; Probenvolumen initial in mm³
;>>
;<< KRAFT - SPANNUNG - DEHNUNG 
    	
	;<< DEHNUNG - axial und volumetrisch +pro Phase !REGLER-FEEDBACK! - pv.Strain_axial
    	Switch pv.Setup.StrainCalc_select ;Berechnen des axial Strain auswahlabhängig 
    		Case 1 ;engineering Strain
    			pv.Strain_axial =(pv.Setzung_FB/(pv.Probe.H_ini))*100 ; Axial in%
;DEL:     			pv.Strain_vol =((1000*pv.DE2_Volumen)/pv.Probe.V_ini)*100 ; Volumetric in %
    		End
    		
    		Case 2 ;logarithmic Strain
    			pv.Strain_axial =(Ln(pv.Probe.Hoehe/(pv.Probe.H_ini))*(-1))*100; Axial
    			pv.Strain_vol =(Ln(pv.Probe.Volumen/pv.Probe.V_ini)*(-1))*100; Volumetric
    		End
    		; falls falsches/kein StrainCalc_select übergeben wird, wird engineering strain gerechnet  
    		Default 
    			pv.Strain_axial = (pv.Setzung_FB/(pv.Probe.H_ini))*100 ; in %
;DEL:     			pv.Strain_vol =((1000*pv.DE2_Volumen)/pv.Probe.V_ini)*100 ; Volumetric in %
    			pv.Setup.StrainCalc_select =1
    		End
    	End  	
     ;>>
    
    ;<< DEHNUNG an der Probe - radial und axial
    pv.Strain_Probe_radial = (((pv.Radial_s1+pv.Radial_s2+pv.Radial_s3)/3) / pv.Probe.D_ini)*100 ; in%
    pv.Strain_Probe_axial = (((pv.Axial_h1+pv.Axial_h2+pv.Axial_h3)/3) / pv.Probe.H_ini)*100 ; in %
    ;>>
    
	;<< MEAN SAMPLE AREA
   	Switch pv.Setup.Sample_AreaCalc ;1=cylindrical, 2=barrel
		Case 1 ; 1=cylindrical
		pv.Probe.A_mean = pv.Probe.A_ini * ((100-pv.Strain_vol)/(100-pv.Strain_axial))
		End
		
		Case 2 ; 2=barrel
		pv.D_h_2 = (pv.Probe.D_ini/4) * (Sqrt( Abs(30*((100-pv.Strain_vol)/(100-pv.Strain_axial))-5)) -1)
		pv.D_h_3 = pv.D_h_2 - (pv.D_h_2 - pv.Probe.D_ini)/12
		pv.Probe.A_mean = 0.785398163 * (pv.D_h_3)^2
		End
		
		Default ; cylindrical wenn kein Wert in Sample_AreaCalc
		pv.Probe.A_mean = pv.Probe.A_ini * ((100-pv.Strain_vol)/(100-pv.Strain_axial))
		pv.Setup.Sample_AreaCalc =1
		End    			
	End
  ;>>
	;<< KRAFT - Fallunterscheidung abhängig von gewähltem Kraftsensor FB
    	Switch pv.Setup.Force_FB_select
    		
    		Case 1 ; externer (am Lastrahmen) Kraftsensor wird verwendet
    			pv.F_axial = pv.Kraft_z_Ext ; Kraft
    		End
    		
    		Case 2 ; interner kleiner (in der Zelle) Kraftsensor wird verwendet
    			pv.F_axial =pv.Kraft_z_Probe_klein
    		End
    		
    		Case 3 ; interner großer (in der Zelle) Kraftsensor wird verwendet
    			pv.F_axial =pv.Kraft_z_Probe_gross
    		End
    		
    		Default
    			pv.F_axial=pv.Kraft_z_Ext
    			pv.Setup.Force_FB_select=1
    		End
    	End
;>>
	;<< EFFEKTIVE Spannung 
    ; axial
    	pv.Sigma_axial_eff = pv.Sigma_axial - pv.Druck_Porenfluid
    ; radial
    ; MEAN 3D STRESS
    	pv.p_mean_eff_stress = (pv.Sigma_axial_eff + 2*pv.Sigma_radial_eff) /3
 ;>>
; Umrechnungsfaktoren für PI Werte 
; aus Kraft in kN zu Spannung in kPa
; aus Weg in mm zu Dehnung in %
hub_strain_coeff = (pv.Probe.H_ini/100)
kraft_stress_coeff =pv.Probe.A_ini/1e+6
if pv.Global_OP_Mode >=2 ; Auto-Test oder PID Tune
	pv.Lim.AllSoft_Off =0 ; alle Soft Grenzwerte einschalten einschalten
	Else
		pv.Lim.AllSoft_Off =1 ; Ausschalten
	End
End
;>>
OnTriggerStart(Phase)
	float Stress_z_max =0 ;Wert je Phase
		
	; Absolute Zeit beim start
	GetDateTime(0, pv.time_Second, pv.time_Minute, pv.time_Hour, pv.time_Day, pv.time_Month, 0)
   	pv.Phasendauer_Cache=0 
   	pv.Phasendauer=0 
	
	Reset_Integral_z =0
   	Counter_z=0
	Hubz_temp =1
	Kraftz_temp =1
	CMDz_temp =1
	Vz_temp =0.1
	Sollz_temp =1
	Istz_temp =1
	
	Reset_Integral_de1 =0
	Counter_de1=0
	CMDde1_temp =1
	Vde1_temp =1
	Sollde1_temp =1
	Istde1_temp =1
	PIDv_de1_temp =1
	Var_Error_de1 =1
	
   	
End
OnTriggerMeasure(Phase)
;<< ******* REGLER Kanäle aus PVs ******* 
; Stellwert-Kanäle de-facto umskaliert um LVDTs zu entsprechen
Stellwert_z = pv.CMD_z + Antrieb_Weg_Z*0
Sollwert_z =pv.Sollwert_z+ Antrieb_Weg_Z*0
Sollwert_z_diff = pv.Sollwert.z_Diff + Antrieb_Weg_Z*0
Istwert_z =pv.Istwert_z+ Antrieb_Weg_Z*0
; Z Achse
Error_Sollist_Z = Mean(Sollwert_z, 500, 50)-Mean(Istwert_z,500, 50)
Error_Sollist_Z_dot  =Smo5(Diff (Error_Sollist_Z))
;PVs für SyncTask beschreiben
pv.Error_Sollist_Z_dot =CurrentValue (Error_Sollist_Z_dot,0,0)	
; finale PIDs als Kanäle
PIDz.P = pv.PIDz.P +Antrieb_Weg_Z*0
PIDz.I = pv.PIDz.I +Antrieb_Weg_Z*0
PIDz.V = pv.PIDz.V +Antrieb_Weg_Z*0
;>>
;<< ******* Messkanäle aus PVs ******
Softramp =pv.SoftRamp+ Antrieb_Weg_Z*0
;<< KRAFT - SPANNUNG - DEHNUNG aus Triggerkanälen
;<< Setzung
Switch pv.Setup.StrainSensor_select
	Case 1 ; Zylinder
	Setzung_FB = Antrieb_Weg_Z - pv.setzung_FB_Offset
	End
	Case 2 ; externe Setzung
	Setzung_FB = Setzung1 - pv.setzung_FB_Offset
	End
End
;>>
	
;<< DEHNUNG - radial und volumetrisch +pro Phase !REGLER-FEEDBACK! - pv.Strain_axial
	Switch pv.Setup.StrainCalc_select ;Berechnen des axial Strain auswahlabhängig 
		Case 1 ;engineering Strain
			Strain_axial =(Setzung_FB/(pv.Probe.H_ini))*100 ; Axial in%
;DEL: 			Strain_vol =((1000*pv.DE2_Volumen)/pv.Probe.V_ini)*100 +Antrieb_Weg_Z*0 ; Volumetric in %
		End
		
		Case 2 ;logarithmic Strain
			Strain_axial =(Ln( (pv.Probe.H_ini - Setzung_FB) /(pv.Probe.H_ini))*(-1))*100; Axial
;DEL: 			Strain_vol =(Ln( (pv.Probe.V_ini- (1000*pv.DE2_Volumen)) /pv.Probe.V_ini)*(-1))*100 +Antrieb_Weg_Z*0; Volumetric
		End
		; falls falsches/kein StrainCalc_select übergeben wird, wird engineering strain gerechnet  
		Default 
			Strain_axial = (Setzung_FB/(pv.Probe.H_ini))*100 ; in %
;DEL: 			Strain_vol =((1000*pv.DE2_Volumen)/pv.Probe.V_ini)*100+Antrieb_Weg_Z*0 ; Volumetric in %
			pv.Setup.StrainCalc_select =1
		End
	End  	
 ;>>
	;>>
 
;<< DEHNUNG an der Probe - radial und axial
Strain_Probe_radial = (((Radial_s1+Radial_s2+Radial_s3)/3) / pv.Probe.D_ini)*100 ; in%
Strain_Probe_axial  = (((Axial_h1+Axial_h2+Axial_h3)/3) / pv.Probe.H_ini)*100 ; in %
;>>
;<< KRAFT								
F_axial = Kraft_z_Ext ; Kraft
;>>
Probe_Hoehe =pv.Probe.Hoehe +Antrieb_Weg_Z*0
;>>
;<< ADAPT integrale Korrekturen 
;<< Z-Achse
;<< Integrale rechnen
HubAchsez_Diff = Abs(Diff(Antrieb_Weg_Z))
Kraft_z_Diff = Abs(Diff (F_axial))
Sollz_Diff = Diff(Sollwert_z)
Istz_Diff = Diff(Istwert_z)
Hubz_integral = Abs(Integral2(HubAchsez_Diff, Reset_Integral_z))
Kraftz_integral = Abs(Integral2(Kraft_z_Diff, Reset_Integral_z))
Istz_integral = Integral2(Istz_Diff, Reset_Integral_z)
Sollz_integral = Integral2(Sollz_Diff, Reset_Integral_z)
CMDz_integral = Integral2(Abs(Stellwert_z), Reset_Integral_z)
Vz_integral = Integral2(Abs(PIDz.V), Reset_Integral_z)
;>>
;<< STEIFIGKEITS-basierter ADAPT ZYKLUS
; Wenn sich ändert Kraft oder Hub UND mind. 0.5sek (Abtastrate Kanäle 200Hz) vergangen
if (CurrentValue(Hubz_integral,0,0)>threshold_hub_int AND Counter_z>200) OR (CurrentValue(Kraftz_integral,0,0)>threshold_kraft_int AND Counter_z>200) OR (CurrentValue(Hubz_integral,0,0)>threshold_hub_int AND CurrentValue(Kraftz_integral,0,0)>threshold_kraft_int) ; index der zu häufige berechnung verhindert
	
		; rechnen neuer Parameter für SlopeClip ADAPT Kanäle
		Hubz_temp= CurrentValue(Hubz_integral,0,0)
		Kraftz_temp= CurrentValue(Kraftz_integral,0,0)
		
		Sollz_temp= CurrentValue(Sollz_integral,0,0)
		Istz_temp= CurrentValue(Istz_integral,0,0)
		
		CMDz_temp = CurrentValue(CMDz_integral,0,0)
		Vz_temp = CurrentValue(Vz_integral,0,0)
		sin_z_Stellw_FFWD_temp = sin_z_Stellw_FFWD_coeff * Abs(0.7*(CMDz_temp/Vz_temp))
		
		;zurücksetzen / updaten für nächsten Zyklus	
		PIDz.P_add=PIDz.P_temp ; im Vorzyklus adaptiertes P dauerhaft übernehmen
		
				;Faktor für Sin-Span Perioden-Error SCHNELL in richtige Region bringen
			if (CMDz_temp/Vz_temp)> 1.25 ; FFWD 80% von CMD und kleiner
			 ;sin_z_ErrorSpan_temp=sin_z_ErrorSpan_temp*0.9*(CMDz_temp/Vz_temp)
			 sin_z_ErrorSpan_temp=1
			End
		
			if (CMDz_temp/Vz_temp)< 0.9 ; FFWD 110% von CMD und größer
			 sin_z_ErrorSpan_temp=sin_z_ErrorSpan_temp*(CMDz_temp/Vz_temp)
			End
		
		Reset_Integral_z=1 ; Reset Integral
		Counter_z=0 ; Reset Counter für Integrationsdauer. Zählen im SyncTask
	Else
	Reset_Integral_z=0	
	End
;>>	
; ***** Steifigkeit
Stiffness_z = SlopeClip( (Kraftz_temp/Hubz_temp)+Antrieb_Weg_Z*0, 0.25) ;maz Änderung 50kN/mm pro s
pv.Sin_z.AvrgStiffness =CurrentValue(Stiffness_z, 0,5)
; ***** Steifigkeit Ende
;<< ***** INTEGRALER ERROR Soll-Ist für 'P' Adapt bei Stress Sinus & allen Rampen
;pv.Error_SollIst_z = 1-Var_Error_z  wird in Rampenblock genullt und im Regler beschrieben
Error_z_new = SlopeClip( (Istz_temp/Sollz_temp) +Antrieb_Weg_Z*0, 1) ;max Änderung 3% pro s
Var_Error_z=CurrentValue(Error_z_new,0,1)
;>> ***** INTEGRALER ERROR Ende
; ********** Verwendung bei RAMPEN! Berechnung nach Steifigkeitszzklus ********** 
;<< ********** Funktion: FFWD an 70% von CMD angleichen ********** 
;'sin_z_Stellw_FFWD_temp = sin_z_Stellw_FFWD_coeff * Abs(0.7*(CMDz_temp/Vz_temp))'
PIDv_gain_z = SlopeClip( sin_z_Stellw_FFWD_temp +Antrieb_Weg_Z*0, 1) ;max Änderung 1 mm/s pro s
sin_z_Stellw_FFWD_coeff = CurrentValue(PIDv_gain_z,0,0) 
; geht direkt in pv.PIDv_z Gleichung
; pv.PIDz.FFWD_Coef= (1/pv.Sin_z.AvrgStiffness) * sin_z_Stellw_FFWD_coeff * kraft_stress_coeff 
; pv.PIDz.V =  pv.PIDz.FFWD_Coef *pv.Sollwert.z_Diff
; ********** Verwendung bei SINUS! Berechnung nach jede Sinus Periode ********** 
; ********** Funktion: sanfte FFWD anpassen bis SOLL=IST Amplitude ********** 
	; benötigt gute Phasen-Korrektur & für schnelle Anpassung wird per 'CMDy_temp/Vy_temp' in Steifigkeitszyklus in
	; richtige Region gebracht
sin_z_ErrorSpan = SlopeClip(sin_z_ErrorSpan_temp +Antrieb_Weg_Z*0, 3) ; (= max.40%/sec) 
var_sin_z_ErrorSpan=CurrentValue(sin_z_ErrorSpan,0,1) ; Span Error nach jeder Periode mit SlopeClip
;STRESS: pv.PIDz.FFWD_Coef= (1/pv.Sin_z.AvrgStiffness) * var_sin_z_ErrorSpan * kraft_stress_coeff
;STRAIN: pv.PIDz.FFWD_Coef= 1 * var_sin_z_ErrorSpan * kraft_stress_coeff
;pv.PIDz.V =  pv.PIDz.FFWD_Coef *pv.Sollwert.z_Diff
;>> ***** FFWD Skalierung Ende
;>> Ende Z ACHSE
;<< ZEIT (Phasendauer) berechnen
	GetDateTime(0, pv.timeN_Second, pv.timeN_Minute, pv.timeN_Hour, pv.timeN_Day, pv.timeN_Month, 0)
	
	; Sekunden werden innerhalb von einem kalendarischen Monat gerechnet
	if pv.time_Month=pv.timeN_Month
	  	pv.Phasendauer=pv.Phasendauer_Cache+(pv.timeN_Day-pv.time_Day)*86400 + (pv.timeN_Hour-pv.time_Hour)*3600 + (pv.timeN_Minute-pv.time_Minute)*60 + (pv.timeN_Second-pv.time_Second)
	End
	
	if pv.time_Month <> pv.timeN_Month ; Monatswechsel hat während der Messung stattgefunden
		pv.Phasendauer=pv.Phasendauer_Cache ; bislang gerechneten Wert zwischenspeichern
		;Anfangsdatum auf das aktuelle Datum schalten und in obere Schleife springen
		GetDateTime(0, pv.time_Second, pv.time_Minute, pv.time_Hour, pv.time_Day, pv.time_Month, 0)
	End
	Phasendauer =pv.Phasendauer+Antrieb_Weg_Z*0  ;Kanal aus pv
;>> 
;<< Stress z MAX berechnen
if Stress_z_max < pv.Sigma_Axial
	Stress_z_max =pv.Sigma_Axial
	End
if Stress_z_max > pv.Sigma_Axial_max
	pv.Sigma_Axial_max=Stress_z_max
	End
;>>
End
OnTriggerEnd(Phase)
	pv.Phasendauer=0    
	pv.SetP_ResetAll =1
	Stress_z_max=0	
End	
OnSyncTask(0.002) ; 500 Hz
	
Counter_z= Counter_z+1					  
	
;<< ************** SENDEN von CANopen Master SYNC  *******
	;***************************************************
	CanMsgSYNC.ID=128 ; x80
	CanMsgSYNC.Len=0
	CanMsgSYNC.Setdata(0, 0, 0, 1, 1, 1, 1.0, 0.0)
    CanMsgSYNC.Transmit1_S1() ; zyklisch
	 ;>>
 
;<< ************** SENDEN von NMT Master   ****************
	;*******************************************************
	
	if VB_NMT_CMD=1 ; Kommando aus Automation für NMT CANopen Dienst an alle
		CanMsgNMT.ID=0
		CanMsgNMT.Len=2
		CanMsgNMT.SetData(pv.NMTall, 0, 0, 8, 1, 2, 1, 0)
		CanMsgNMT.SetData(0, 1, 0, 8, 1, 2, 1, 0) 
		CanMsgNMT.Transmit1_S1()
		
		VB_NMT_CMD=0 ; Einmaliger Versand
		End
	;>>
;<< Reset aller Phasen-Parameter nach/vor jeder Phase
if pv.SetP_ResetAll =1 
pv.PIDz.v=0
;index in Generatoren nullen
index_ramp_z=0
index_sin_z=0
;Axle1 = z-Achse
pv.SetP_Axle1.mode	=0
pv.SetP_Axle1.shape	=0
pv.SetP_Axle1.ampl	=0
pv.SetP_Axle1.midvalue	=0
pv.SetP_Axle1.midvalue_current_value =0
pv.SetP_Axle1.phasenr	=0
pv.SetP_Axle1.freq	=0
pv.SetP_Axle1.rate	=0
pv.SetP_Axle1.springconst	=0
pv.SetP_Axle1.PShift1 =0
pv.SetP_Axle1.PShift2 =0
;Stop Criteria
pv.Criteria1.Type =0
pv.Criteria1.Value =0
pv.Criteria2.Type =0
pv.Criteria2.Value =0
pv.Criteria3.Type =0
pv.Criteria3.Value =0
pv.Criteria.Bool =1 ; 1= OR; 2= AND all
pv.SetP_ResetAll =0
End
;>>
;<< ************ statische Wegregelung LR ************
; Funktion: Zylinder statisch in Pos halten wenn keine Sollwertkurve vorhanden
;VB_Setpoint_Static_LR_CMD wird gesetzt in Automation, zwischen Phasen, QuickStop, 
;Fehlerbehandlungen etc.
if VB_Hydraulics_On=1 AND pv.LR_inRegelung=0
	
	VB_Setpoint_Static_LR_CMD=1
	End
	
if VB_Hydraulics_On=1 AND pv.LR_inRegelung=1
	
	; bei Beginn der Regelung Modus für Regler umschalten
	; bei PID modus in Automation pv.ModeFB_z setzen
	if pv.Global_OP_Mode=2 AND pv.SetP_Axle1.mode=1 ; Auto-Test & Stress
		pv.ModeFB_z=5 ; Stress		
		End
	
	if pv.Global_OP_Mode=2 AND pv.SetP_Axle1.mode=2 ; Auto-Test & Strain
		pv.ModeFB_z=4 ; Strain		
		End
	
	if pv.Global_OP_Mode=2 AND pv.SetP_Axle1.mode=4 ; Auto-Test & Weg (Feder)
		pv.ModeFB_z=2 ; Strain		
		End
		
	VB_Setpoint_Static_LR_CMD=0
	
	End
if VB_Hydraulics_On=0
	pv.LR_inRegelung=0
	VB_Setpoint_Static_LR_CMD=0
End
; wenn Hydraulik AN 
if VB_Setpoint_Static_LR_CMD=1
	
	if Counter_SetpLR=0 ; beim ersten Durchlauf Soll-Position beschreiben
		
		pv.ModeFB_z=2  ;Weg
		pv.Sollwert_z = pv.Antrieb_Weg_Z ; Wegposition bei Beginn
		
		Counter_SetpLR = Counter_SetpLR+1
		End
	
	VB_Calc_z = 1 ; Regler rechnen und analog senden
End
if VB_Setpoint_Static_LR_CMD=0
	Counter_SetpLR=0 ;zurücksetzen für nächsten Einsatz
End
;>>
	
;<< ************** SINUS SIGNAL-GENERATOR Z-ACHSE ************** 
if VB_SinStart_z=1
	if index_sin_z =0 ; einmalig Sinus parametrieren
		
		if pv.Global_OP_Mode <>2 ; kein Auto-Mode. Sollwerte von UI übernehmen
		pv.SetP_Axle1.freq =DV_Tune.Freq1
		;pv.SetP_Axle1.freq2 =DV_Tune.Freq2
		pv.SetP_Axle1.midvalue =DV_Tune.MidValue
		pv.SetP_Axle1.ampl =DV_Tune.Ampl1
		;pv.SetP_Axle1.ampl2 =DV_Tune.Ampl2
		;pv.SetP_Axle1.PShift1 =DV_Tune.Phase1
		;pv.SetP_Axle1.PShift2 =DV_Tune.Phase2
		End
		
	Sin_inkrement.z1=2*Pi*pv.SyncCycle*pv.SetP_Axle1.freq
	Sin_Counter.z1=0 ;Sin Argument 'z'
		
	pv.Sin_z.CycleCount =0 ; Zähler Zzklen von langsamsten Sinus
	
	PIDz.P_temp=0
	PIDz.P_add=0 ; Summierter ADAPT P Anteil
	pv.PIDz.V=0
	pv.PIDz.FFWD_Coef=0.01
	
	; Min - Max Werte pro Periode für Weg/Strain Vorsteuerung
	sin_z_SollMax =pv.SetP_Axle1.midvalue
	sin_z_SollMin =pv.SetP_Axle1.midvalue
	sin_z_IstMax =pv.SetP_Axle1.midvalue
	sin_z_IstMin =pv.SetP_Axle1.midvalue
	
	Var_sin_z_ErrorSpan =1 ;je Sinus Periode 
	sin_z_ErrorSpan_temp =1
	
	; offset von CMD für FFWD
	sin_z_CMDoffset =0
	
	if pv.SetP_Axle1.shape=3 AND pv.SetP_Axle1.mode=1  ; relative Sine & Stress
		pv.SetP_Axle1.midvalue=pv.Sigma_Axial_max
		pv.SetP_Axle1.shape=2
	End
	
	;<< ADAPT Params & Vorsteuersignale
	;erste Werte für FFWD Skalierung setzen	
	if pv.ModeFB_z = 2 ; Weg
		sin_z_Stellw_FFWD_temp =1
		sin_z_Stellw_FFWD_coeff =1
		End
		
	if pv.ModeFB_z = 3 ; Kraft
		sin_z_Stellw_FFWD_temp =1
		sin_z_Stellw_FFWD_coeff =1
		End
	
	if pv.ModeFB_z = 4 OR pv.SetP_Axle1.mode =2 ; Strain
		sin_z_Stellw_FFWD_temp =0
		sin_z_Stellw_FFWD_coeff =100
		End
		
	if pv.ModeFB_z = 5 OR pv.SetP_Axle1.mode =1 ; Stress
		sin_z_Stellw_FFWD_temp =1
		sin_z_Stellw_FFWD_coeff =1
		End
	
	; Error ini auch für SlopeClip
	Istz_temp=1
	Sollz_temp=1
	pv.Error_SollIst_z =0 ;Fehler je Zzklus
	
	; Steifigkeit Ini
	Kraftz_temp=1
	Hubz_temp=1
	;>>
		
	index_sin_z =index_sin_z+1 ; nullen über pv.SetP_ResetAll=1
	
	End
	;Ende einmaliges Parametrieren
	
	
	; Sollwert für überlagerten Sinus wird berechnet. 
	; Sinus 'Mittelwert' soll zuvor in Automation angefahren werden	
	pv.Sollwert_z = pv.SetP_Axle1.midvalue + pv.SoftRamp * pv.SetP_Axle1.ampl* SIN(Sin_inkrement.z1*sin_Counter.z1 +(pv.SetP_Axle1.PShift1* Pi/180))
	
	; für Regler-Vorsteuerung
	; Ableitung von Sollwert
	pv.Sollwert.z_Diff = pv.SoftRamp*( (2*Pi*pv.SetP_Axle1.freq)*pv.SetP_Axle1.ampl* Cos (Sin_inkrement.z1*sin_Counter.z1 +(pv.SetP_Axle1.PShift1*Pi/180)+(pv.PIDz.FFWD_Phase* Pi /180)))
	
	; Sin Argument hochzählen
	sin_Counter.z1 =sin_Counter.z1+1
	;<< Min und Max Soll-Ist für 1 Periode berechnen
	; 
	if pv.Sollwert_z >sin_z_SollMax
		sin_z_SollMax=pv.Sollwert_z
		End
	if pv.Sollwert_z <sin_z_SollMin
		sin_z_SollMin=pv.Sollwert_z
		End
	if pv.Istwert_z >sin_z_IstMax
		sin_z_IstMax=pv.Istwert_z
		End
	if pv.Istwert_z <sin_z_IstMin
		sin_z_IstMin=pv.Istwert_z
		End
	
	sin_z_CMDoffset_temp = sin_z_CMDoffset_temp + pv.CMD_z
		
	; 'sin_z_ErrorSpan_temp' Update am Ende jeder Periode
	; sin_z_ErrorSpan_temp = ((sin_z_SollMax-sin_z_SollMin) - (sin_z_IstMax-sin_z_IstMin))/ (sin_z_SollMax-sin_z_SollMin)
	; Kanal 'sin_z_ErrorSpan' mit SlopeClip wird bei Adapt gerechnet
	; CurrenValue von SlopeClip als Faktor von 'pv.PIDz.FFWD_Coef' beim Regler 
	;>>
	; Vorsteuerglied 'V' für Regler
	; 'pv.PIDz.FFWD_Coef' abhängig von Modus und Shape
		if VB_ADAPT_On =1
			
		pv.PIDz.V =  pv.PIDz.FFWD_Coef *pv.Sollwert.z_Diff + sin_z_CMDoffset 
		Else
		pv.PIDz.V =  0
		End
	
;<< AKTIONEN am Ende einer Sinus Periode
		; Sinus volle Periode
		if sin_Counter.z1 >= (1/(pv.SyncCycle*pv.SetP_Axle1.freq)); Anzahl Punkte pro volle Sinus Periode
				
			sin_z_ErrorSpan_temp = var_sin_z_ErrorSpan*((sin_z_SollMax-sin_z_SollMin)/(sin_z_IstMax-sin_z_IstMin))
			sin_z_CMDoffset = sin_z_CMDoffset_temp/sin_Counter.z1 ; Mittelwert von CMD
			
			sin_Counter.z1=0
			
			sin_z_SollMax =0
			sin_z_SollMin =0
			sin_z_IstMax =0
			sin_z_IstMin =0
			sin_z_CMDoffset_temp=0
					
			if pv.Global_OP_Mode <>2 ; kein Auto-Mode. Sollwerte von UI übernehmen nur für diesen Sinus!
				pv.SetP_Axle1.freq =DV_Tune.Freq1
				pv.SetP_Axle1.midvalue =DV_Tune.MidValue
				pv.SetP_Axle1.ampl =DV_Tune.Ampl1
				
						
			Sin_inkrement.z1=2*Pi*pv.SyncCycle*pv.SetP_Axle1.freq ; falls geändert z.B. in PID Tune
			End
		
		End
	
;>>	
VB_SinStart_z=0 ; wird zzklisch in Automation gesetzt
pv.LR_inRegelung=1
VB_Calc_z=1  ;Regler rechnen
End ;>>
;<< ************** RAMPE SIGNAL-GENERATOR Z-ACHSE **************
if VB_RampStart_z=1
		;********** bei erster Ausführung *********
		if index_ramp_z=0
			;***** STRESS mode ************ AUTO MODE *************** RAMPE
			if pv.SetP_Axle1.mode=1 AND pv.Global_OP_Mode=2 AND pv.SetP_Axle1.shape=1
				
				;erste Soll-Ist beschreiben
				pv.Sollwert_z =pv.Sigma_Axial
				pv.Istwert_z =pv.Sigma_Axial
				
				;FeedForward nicht umskaliert
				pv.Sollwert.z_Diff =pv.SetP_Axle1.rate ; Steigung noch in kPa/s
				pv.Ramp_z.Startwert = pv.Sigma_Axial ;aktuellen Wert übernehmen
			
			 ; AUTO-MODE: Rampen-Endwert setzen falls ein Kriterium definiert ist
				
				;<< Stress Axial
				if pv.Criteria1.Type=1
				pv.Ramp_z.Endwert=pv.Criteria1.Value
				END
				if pv.Criteria2.Type=1
				pv.Ramp_z.Endwert=pv.Criteria2.Value
				END
				if pv.Criteria3.Type=1
				pv.Ramp_z.Endwert=pv.Criteria3.Value
				END
				;>>
				
				;<< n-faches von pv.Sigma_Axial_max
				if pv.Criteria1.Type=7
				pv.Ramp_z.Endwert=pv.Criteria1.Value*pv.Sigma_Axial_max
				pv.SetP_Axle1.midvalue=pv.Ramp_z.Endwert
				pv.SetP_Axle1.shape=2
				END
				if pv.Criteria2.Type=7
				pv.Ramp_z.Endwert=pv.Criteria2.Value*pv.Sigma_Axial_max
				pv.SetP_Axle1.midvalue=pv.Ramp_z.Endwert
				pv.SetP_Axle1.shape=2
				END
				if pv.Criteria3.Type=7
				pv.Ramp_z.Endwert=pv.Criteria3.Value*pv.Sigma_Axial_max
				pv.SetP_Axle1.midvalue=pv.Ramp_z.Endwert
				pv.SetP_Axle1.shape=2
				END
				;>>
				
				;<< q deviator & Stress radial
				if pv.Criteria1.Type=9 AND pv.Criteria2.Type=2 
				pv.Ramp_z.Endwert=pv.Criteria1.Value + pv.Criteria2.Value ; =q+Sigma_radial
				END
				if pv.Criteria1.Type=9 AND pv.Criteria3.Type=2 
				pv.Ramp_z.Endwert=pv.Criteria1.Value + pv.Criteria3.Value ; =q+Sigma_radial
				END
				
				if pv.Criteria2.Type=9 AND pv.Criteria1.Type=2 
				pv.Ramp_z.Endwert=pv.Criteria2.Value + pv.Criteria1.Value ; =q+Sigma_radial
				END
				if pv.Criteria2.Type=9 AND pv.Criteria3.Type=2 
				pv.Ramp_z.Endwert=pv.Criteria2.Value + pv.Criteria3.Value ; =q+Sigma_radial
				END
				
				if pv.Criteria3.Type=9 AND pv.Criteria1.Type=2 
				pv.Ramp_z.Endwert=pv.Criteria3.Value + pv.Criteria1.Value ; =q+Sigma_radial
				END
				if pv.Criteria3.Type=9 AND pv.Criteria2.Type=2 
				pv.Ramp_z.Endwert=pv.Criteria3.Value + pv.Criteria2.Value ; =q+Sigma_radial
				END
				;>>
				
				;<< q deviator & Stress radial mit Rate=0 ohne Kriterium
				if pv.Criteria1.Type=9 AND pv.SetP_Axle2.mode=1 AND pv.SetP_Axle2.rate=0
				pv.Ramp_z.Endwert=pv.Criteria1.Value + pv.Druck_VPC_Zelle ; =q+aktueller Wert von Sigma_radial
				END
				
				if pv.Criteria2.Type=9 AND pv.SetP_Axle2.mode=1 AND pv.SetP_Axle2.rate=0
				pv.Ramp_z.Endwert=pv.Criteria2.Value + pv.Druck_VPC_Zelle ; =q+aktueller Wert von Sigma_radial
				END
				
				if pv.Criteria3.Type=9 AND pv.SetP_Axle2.mode=1 AND pv.SetP_Axle2.rate=0
				pv.Ramp_z.Endwert=pv.Criteria3.Value + pv.Druck_VPC_Zelle ; =q+aktueller Wert von Sigma_radial
				END				
				;>>
				;<< P_mean_eff & Sigma_radial & Porendruck ALLE als Ziele
					; Formel: Sigma_axial = 3*p' + 3*u - 2*Sigma_radial
					
				if pv.Criteria1.Type=10 AND pv.Criteria2.Type=2 AND pv.Criteria3.Type=3
				pv.Ramp_z.Endwert=3*pv.Criteria1.Value + 3*pv.Criteria3.Value - 2*pv.Criteria2.Value
				END
				if pv.Criteria1.Type=10 AND pv.Criteria2.Type=3 AND pv.Criteria3.Type=2
				pv.Ramp_z.Endwert=3*pv.Criteria1.Value - 2*pv.Criteria3.Value + 3*pv.Criteria2.Value
				END
				
				if pv.Criteria1.Type=3 AND pv.Criteria2.Type=10 AND pv.Criteria3.Type=2
				pv.Ramp_z.Endwert=3*pv.Criteria2.Value + 3*pv.Criteria1.Value - 2*pv.Criteria3.Value
				END
				if pv.Criteria1.Type=2 AND pv.Criteria2.Type=10 AND pv.Criteria3.Type=3
				pv.Ramp_z.Endwert=3*pv.Criteria2.Value + 3*pv.Criteria3.Value - 2*pv.Criteria1.Value
				END
				
				if pv.Criteria1.Type=3 AND pv.Criteria2.Type=2 AND pv.Criteria3.Type=10
				pv.Ramp_z.Endwert=3*pv.Criteria3.Value + 3*pv.Criteria1.Value - 2*pv.Criteria2.Value
				END
				if pv.Criteria1.Type=2 AND pv.Criteria2.Type=3 AND pv.Criteria3.Type=10
				pv.Ramp_z.Endwert=3*pv.Criteria3.Value + 3*pv.Criteria2.Value - 2*pv.Criteria1.Value
				END				
				;>>
				
				;<< P_mean_eff & Sigma_radial als Ziele & Porendruck als Rate=0	
			
				if pv.Criteria1.Type=10 AND pv.Criteria2.Type=2 AND pv.SetP_Axle3.mode=1 AND pv.SetP_Axle3.rate=0
				pv.Ramp_z.Endwert=3*pv.Criteria1.Value + 3*pv.Druck_Porenfluid - 2*pv.Criteria2.Value
				END
				if pv.Criteria1.Type=10 AND pv.Criteria3.Type=2 AND pv.SetP_Axle3.mode=1 AND pv.SetP_Axle3.rate=0
				pv.Ramp_z.Endwert=3*pv.Criteria1.Value + 3*pv.Druck_Porenfluid - 2*pv.Criteria3.Value
				END
				
				if pv.Criteria2.Type=10 AND pv.Criteria1.Type=2 AND pv.SetP_Axle3.mode=1 AND pv.SetP_Axle3.rate=0
				pv.Ramp_z.Endwert=3*pv.Criteria2.Value + 3*pv.Druck_Porenfluid - 2*pv.Criteria1.Value
				END
				if pv.Criteria2.Type=10 AND pv.Criteria3.Type=2 AND pv.SetP_Axle3.mode=1 AND pv.SetP_Axle3.rate=0
				pv.Ramp_z.Endwert=3*pv.Criteria2.Value + 3*pv.Druck_Porenfluid - 2*pv.Criteria3.Value
				END
				
				if pv.Criteria3.Type=10 AND pv.Criteria1.Type=2 AND pv.SetP_Axle3.mode=1 AND pv.SetP_Axle3.rate=0
				pv.Ramp_z.Endwert=3*pv.Criteria3.Value + 3*pv.Druck_Porenfluid - 2*pv.Criteria1.Value
				END
				if pv.Criteria3.Type=10 AND pv.Criteria2.Type=2 AND pv.SetP_Axle3.mode=1 AND pv.SetP_Axle3.rate=0
				pv.Ramp_z.Endwert=3*pv.Criteria3.Value + 3*pv.Druck_Porenfluid - 2*pv.Criteria2.Value
				END				
				;>>
				
				;<< P_mean_eff & Sigma_radial als Rate=0 & Porendruck als Rate=0
				if pv.Criteria1.Type=10 AND pv.SetP_Axle2.mode=1 AND pv.SetP_Axle2.rate=0 AND pv.SetP_Axle3.mode=1 AND pv.SetP_Axle3.rate=0
				pv.Ramp_z.Endwert=3*pv.Criteria1.Value + 3*pv.Druck_Porenfluid - 2*pv.Druck_VPC_Zelle
				END
				if pv.Criteria2.Type=10 AND pv.SetP_Axle2.mode=1 AND pv.SetP_Axle2.rate=0 AND pv.SetP_Axle3.mode=1 AND pv.SetP_Axle3.rate=0
				pv.Ramp_z.Endwert=3*pv.Criteria2.Value + 3*pv.Druck_Porenfluid - 2*pv.Druck_VPC_Zelle
				END
				if pv.Criteria3.Type=10 AND pv.SetP_Axle2.mode=1 AND pv.SetP_Axle2.rate=0 AND pv.SetP_Axle3.mode=1 AND pv.SetP_Axle3.rate=0
				pv.Ramp_z.Endwert=3*pv.Criteria3.Value + 3*pv.Druck_Porenfluid - 2*pv.Druck_VPC_Zelle
				END				
				;>>
				
				;<< P_mean_eff & Porendruck als Ziele & Sigma_radial als Rate=0
				if pv.Criteria1.Type=10 AND pv.Criteria2.Type=3 AND pv.SetP_Axle2.mode=1 AND pv.SetP_Axle2.rate=0
				pv.Ramp_z.Endwert=3*pv.Criteria1.Value + 3*pv.Criteria2.Value - 2*pv.Druck_VPC_Zelle
				END
				if pv.Criteria1.Type=10 AND pv.Criteria3.Type=3 AND pv.SetP_Axle2.mode=1 AND pv.SetP_Axle2.rate=0
				pv.Ramp_z.Endwert=3*pv.Criteria1.Value + 3*pv.Criteria3.Value - 2*pv.Druck_VPC_Zelle
				END
				
				if pv.Criteria2.Type=10 AND pv.Criteria1.Type=3 AND pv.SetP_Axle2.mode=1 AND pv.SetP_Axle2.rate=0
				pv.Ramp_z.Endwert=3*pv.Criteria2.Value + 3*pv.Criteria1.Value - 2*pv.Druck_VPC_Zelle
				END
				if pv.Criteria2.Type=10 AND pv.Criteria3.Type=3 AND pv.SetP_Axle2.mode=1 AND pv.SetP_Axle2.rate=0
				pv.Ramp_z.Endwert=3*pv.Criteria2.Value + 3*pv.Criteria3.Value - 2*pv.Druck_VPC_Zelle
				END
				
				if pv.Criteria3.Type=10 AND pv.Criteria1.Type=3 AND pv.SetP_Axle2.mode=1 AND pv.SetP_Axle2.rate=0
				pv.Ramp_z.Endwert=3*pv.Criteria3.Value + 3*pv.Criteria1.Value - 2*pv.Druck_VPC_Zelle
				END
				if pv.Criteria3.Type=10 AND pv.Criteria2.Type=3 AND pv.SetP_Axle2.mode=1 AND pv.SetP_Axle2.rate=0
				pv.Ramp_z.Endwert=3*pv.Criteria3.Value + 3*pv.Criteria2.Value - 2*pv.Druck_VPC_Zelle
				END				
				;>>
				
				;<< kein Kriterium definiert: weder Sigma_axial, n-fach Sigma, q, p'
				if pv.Criteria1.Type<>1 AND pv.Criteria2.Type<>1 AND pv.Criteria3.Type<>1 AND pv.Criteria1.Type<>7 AND pv.Criteria2.Type<>7 AND pv.Criteria3.Type<>7 AND pv.Criteria1.Type<>9 AND pv.Criteria2.Type<>9 AND pv.Criteria3.Type<>9 AND pv.Criteria1.Type<>10 AND pv.Criteria2.Type<>10 AND pv.Criteria3.Type<>10
				
					if pv.SetP_Axle1.rate>0
					pv.Ramp_z.Endwert= (pv.Lim.KraftZ_max/pv.Probe.A_ini)*1e+6 ; in kPa bei max. Kraft Z
					END
					if pv.SetP_Axle1.rate<0
					pv.Ramp_z.Endwert=0
					END
					if pv.SetP_Axle1.rate=0 ; DWELL Halten
					pv.Ramp_z.Endwert=pv.Sigma_Axial
					END
				END
				;>>
			END 
			
			;***** STRESS mode ***** AUTO MODE ***** Sinus (Rampe zum Start)
			if pv.SetP_Axle1.mode=1 AND pv.Global_OP_Mode=2 AND (pv.SetP_Axle1.shape=2 OR pv.SetP_Axle1.shape=3)
			
			;erste Soll-Ist beschreiben
			pv.Sollwert_z =pv.Sigma_Axial
			pv.Istwert_z =pv.Sigma_Axial
			
			pv.Ramp_z.Startwert = pv.Sigma_Axial ;aktuellen Wert übernehmen
			
			End
			
			; Sinus MidValue vom aktuellen Wert
			if pv.SetP_Axle1.midvalue_current_value=1
				pv.SetP_Axle1.midvalue = pv.Sigma_Axial
				pv.Ramp_z.Endwert = pv.SetP_Axle1.midvalue
				Else
				pv.Ramp_z.Endwert = pv.SetP_Axle1.midvalue ; Sin Mittelwert
				End
			
			;FeedForward nicht umskaliert & fix
			pv.Sollwert.z_Diff = (pv.Ramp_z.Endwert-pv.Ramp_z.Startwert)/pv.SoftRampTime; Steigung noch in kPa/s
		
			
			;**** PID TUNE - Rampe zum Sinus 			
			if pv.SetP_Axle1.mode=1 AND pv.Global_OP_Mode=3 ; z-PID Tune
			
			;erste Soll-Ist beschreiben
			pv.Sollwert_z =pv.Sigma_Axial
			pv.Istwert_z =pv.Sigma_Axial
			pv.Ramp_z.Startwert = pv.Sigma_Axial ;aktuellen Wert übernehmen
			pv.Ramp_z.Endwert = DV_Tune.MidValue
			
			;FeedForward nicht umskaliert & fix
			pv.Sollwert.z_Diff = (pv.Ramp_z.Endwert-pv.Ramp_z.Startwert)/pv.SoftRampTime; Steigung noch in kPa/s			
			End
		 ; ENDE STRESS Ersatzparameter Rampe
			
		 ;***** STRAIN mode ***** AUTO MODE ***** RAMPE 
		 	if pv.SetP_Axle1.mode=2 AND pv.Global_OP_Mode=2 AND pv.SetP_Axle1.shape=1 ;AUTO MODE RAMP
			
				pv.Sollwert_z =pv.Strain_axial
				pv.Istwert_z =pv.Strain_axial
				pv.Ramp_z.Startwert = pv.Strain_axial ;aktuellen Wert übernehmen
				
				;FeedForward nicht umskaliert
				pv.Sollwert.z_Diff =pv.SetP_Axle1.rate ; Steigung noch in %/s
			
			 ; Endwert setzen falls ein Kriterium definiert ist
			 	; Strain axial
				if pv.Criteria1.Type=4
				pv.Ramp_z.Endwert=pv.Criteria1.Value
				END
				if pv.Criteria2.Type=4
				pv.Ramp_z.Endwert=pv.Criteria2.Value
				END
				if pv.Criteria3.Type=4
				pv.Ramp_z.Endwert=pv.Criteria3.Value
				END
				; nichts definiert in Kriterien
				if pv.Criteria1.Type<>4 AND pv.Criteria2.Type<>4 AND pv.Criteria3.Type<>4
				 	if pv.SetP_Axle1.rate>0
					pv.Ramp_z.Endwert=15
					END
					if pv.SetP_Axle1.rate<0
					pv.Ramp_z.Endwert=0
					END
					if pv.SetP_Axle1.rate=0 ; DWELL Halten
					pv.Ramp_z.Endwert=pv.Strain_axial
					END
				END
			END
			
			; Sinus - Rampe zum Start
			if pv.SetP_Axle1.mode=2 AND pv.Global_OP_Mode=2 AND (pv.SetP_Axle1.shape=2 OR pv.SetP_Axle1.shape=3)
			
			pv.Sollwert_z =pv.Strain_axial
			pv.Istwert_z =pv.Strain_axial
			
			; Sinus MidValue vom aktuellen Wert
			if pv.SetP_Axle1.midvalue_current_value=1
				pv.SetP_Axle1.midvalue = pv.Strain_axial
				pv.Ramp_z.Endwert = pv.SetP_Axle1.midvalue 
				Else
				pv.Ramp_z.Endwert = pv.SetP_Axle1.midvalue ; Sin Mittelwert
				End
				pv.Ramp_z.Startwert = pv.Strain_axial ;aktuellen Wert übernehmen
			
			;FeedForward nicht umskaliert & fix
			pv.Sollwert.z_Diff = (pv.Ramp_z.Endwert-pv.Ramp_z.Startwert)/pv.SoftRampTime; Steigung noch in %/s
			End
			
			;PID TUNE Rampe zum Sinus 			
			if pv.SetP_Axle1.mode=2 AND pv.Global_OP_Mode<>2 
				
			pv.Sollwert_z =pv.Strain_axial
			pv.Istwert_z =pv.Strain_axial
			
			pv.Ramp_z.Startwert = pv.Strain_axial ;aktuellen Wert übernehmen
			pv.Ramp_z.Endwert = DV_Tune.MidValue
			
			;FeedForward nicht umskaliert & fix
			pv.Sollwert.z_Diff = (pv.Ramp_z.Endwert-pv.Ramp_z.Startwert)/pv.SoftRampTime; Steigung noch in %/s	
			End			
		 ; ENDE STRAIN Parameter Rampe
		
		 ; ***** KRAFT mode *****	
			;PID TUNE Rampe zum Sinus 			
			if pv.ModeFB_z=3 AND pv.Global_OP_Mode<>2 
			
			pv.Sollwert_z =pv.F_Axial
			pv.Istwert_z =pv.F_Axial
			
			pv.Ramp_z.Startwert = pv.F_axial ;aktuellen Wert übernehmen
			pv.Ramp_z.Endwert = DV_Tune.MidValue
			
			;FeedForward nicht umskaliert & fix
			pv.Sollwert.z_Diff = (pv.Ramp_z.Endwert-pv.Ramp_z.Startwert)/pv.SoftRampTime; Steigung noch in kN/s	
			End			
		 ; ENDE KRAFT Parameter Rampe
		
		 ; ***** WEG mode *****	
			;PID TUNE Rampe zum Sinus 			
			if pv.ModeFB_z=2 AND pv.Global_OP_Mode<>2 
			
			pv.Sollwert_z =pv.Antrieb_Weg_Z
			pv.Istwert_z =pv.Antrieb_Weg_Z
			
			pv.Ramp_z.Startwert = pv.Antrieb_Weg_Z ;aktuellen Wert übernehmen
			pv.Ramp_z.Endwert = DV_Tune.MidValue
			
			;FeedForward nicht umskaliert & fix
			pv.Sollwert.z_Diff = (pv.Ramp_z.Endwert-pv.Ramp_z.Startwert)/pv.SoftRampTime; Steigung in mm/s	
			End			
		 ; ENDE WEG Parameter Rampe
			
		; ***** Virtual Spring *****
		 	if pv.Global_OP_Mode=2 AND pv.SetP_Axle1.shape=4
		 	
		 	Hub_z_spring0 = pv.Antrieb_Weg_Z
		 	Kraft_z_spring0 = pv.F_axial
		 	
		 	pv.Sollwert.z_Diff = 0
		 		End
		; ***** End Virtual Spring *****
		
		 ;**** NULLEN PARAMETER
		 PIDz.P_temp=0
		 PIDz.P_add=0
		 pv.PIDz.V=0
		
			;erste Werte für FFWD Skalierung setzen	
				
			if pv.ModeFB_z = 2 ; Weg
				sin_z_Stellw_FFWD_temp =1
				sin_z_Stellw_FFWD_coeff =1
				End
				
			if pv.ModeFB_z = 3 OR  pv.SetP_Axle1.shape=4 ; Kraft
				sin_z_Stellw_FFWD_temp =1
				sin_z_Stellw_FFWD_coeff =1
				End
			
			if pv.ModeFB_z = 4 OR pv.SetP_Axle1.mode =2 ; Strain
				sin_z_Stellw_FFWD_temp =0
				sin_z_Stellw_FFWD_coeff =100
				End
				
			if pv.ModeFB_z = 5 OR pv.SetP_Axle1.mode =1 ; Stress
				sin_z_Stellw_FFWD_temp =1
				sin_z_Stellw_FFWD_coeff =1
				End
		
			; Error ini auch für SlopeClip
			Istz_temp=1
			Sollz_temp=1
			pv.Error_SollIst_z =0 ;Fehler je Zyklus
			
			; Steifigkeit Ini
			Kraftz_temp=1
			Hubz_temp=1
			
			; CMD offset für FFWD
			sin_z_CMDoffset_temp =0
			sin_z_CMDoffset =0
				
	End 
		;***** Ende ERSTER Durchlauf index_ramp_z=0
				
		; Vorzeichen für FFWD bestimmen
		if pv.Ramp_z.Endwert > pv.Ramp_z.Startwert
			pv.Sollwert.z_Diff = Abs(pv.Sollwert.z_Diff)			
			End
		
		if pv.Ramp_z.Endwert < pv.Ramp_z.Startwert
			pv.Sollwert.z_Diff = Abs(pv.Sollwert.z_Diff)*(-1)			
			End		
		
		if pv.Ramp_z.Endwert = pv.Ramp_z.Startwert
			pv.Sollwert.z_Diff = 0			
			End			
	
		; Vorsteuerglied 'V' für Regler
		; 'pv.PIDz.FFWD_Coef' abhängig von Modus und Shape
		if VB_ADAPT_On =1
			
		pv.PIDz.V =  pv.PIDz.FFWD_Coef *pv.Sollwert.z_Diff
		Else
		pv.PIDz.V =  0
		End
		
		; Sollwert für Virt. Spring
		if pv.SetP_Axle1.shape=4
			; Regeln nach WEG
			; Sprin Constant in kN/mm !
		pv.Sollwert_z = Hub_z_spring0 + ( (Kraft_z_spring0 - pv.F_axial)/pv.SetP_Axle1.springconst )
			End
	
	if index_ramp_z >=1
	pv.LR_inRegelung=1
	VB_Calc_z=1  ;Regler rechnen. Nicht rechnen beim ersten Durchlauf
	End
	
	index_ramp_z =index_ramp_z+1	
	VB_RampStart_z=0 ; wird zyklisch in Automation gesetzt
	
End  ; Ramp Start ENDE
;>>
				
	
		
;<< ************** REGLER Z-ACHSE **************
if VB_Calc_z=1 
	
	if VB_Setpoint_Static_LR_CMD=0 ; normalbetrieb, keine statische Regelung
;DISPLACEMENT PID tune mode & kein Auto-Test ODER Virt Spring
	if (pv.ModeFB_z=2 AND pv.Global_OP_Mode <>2) OR  (pv.Global_OP_Mode =2 AND pv.SetP_Axle1.shape=4)
		
	pv.Istwert_z = pv.Antrieb_Weg_Z
	pv.PIDz.FFWD_Phase=2.9224*pv.SetP_Axle1.freq -8.1207 
	
	if pv.SetP_Axle1.shape=2 OR pv.SetP_Axle1.shape=3 ; Sine
	
	pv.PIDz.FFWD_Coef= 1*var_sin_z_ErrorSpan  ;Amplitude der Vorsteuerung anpassen
	pv.Error_SollIst_z = 1-pv.Istwert_z/pv.Sollwert_z; Echtzeitfehler
	
	Else
	pv.PIDz.FFWD_Coef=(1 / pv.Sin_z.AvrgStiffness)*sin_z_Stellw_FFWD_coeff  ;Rampen
	pv.Error_SollIst_z = 1-Var_Error_z ; Fehler für P integral nach Steifigkeitszyklus
		End
	
	if VB_ADAPT_On=1
		
		pv.PIDz.P=	pv.PIDz.P_s * (1+ pv.PIDz.Pgain_s * pv.Error_Sollist_z);+PIDz.P_add
		pv.PIDz.I=	pv.PIDz.I_s / (1+ pv.PIDz.Igain_Errdot_s * Abs(pv.Error_Sollist_z_dot))
		
		;PIDz.P_temp= PIDz.P_add + pv.PIDz.P_s*(pv.PIDz.Pgain_s * pv.Error_Sollist_z)
		
			if pv.PIDz.P > PIDz_P_lim  ; Schutz gegen zu hohe P Adapt
			pv.PIDz.P= PIDz_P_lim
			End
			if pv.PIDz.P < 1
			pv.PIDz.P =1
			End
		
		Else
			pv.PIDz.P=	pv.PIDz.P_s
			pv.PIDz.I=	pv.PIDz.I_s	
			PIDz.P_add=0
			PIDz.P_temp=0
		End		
	End
	
;STRAIN PID & AUTO, Sine Shape
	if (pv.ModeFB_z=4 AND pv.Global_OP_Mode <>2) OR (pv.Global_OP_Mode=2 AND pv.SetP_Axle1.mode=2 AND pv.SetP_Axle1.shape<>4) 
	
	pv.Istwert_z = pv.Strain_axial
	pv.PIDz.FFWD_Phase=2.9224*pv.SetP_Axle1.freq -8.1207 
	
	;<< LIMITS FÜR GERECHNETE ADAPT PARAMETER
	if pv.Sin_z.AvrgStiffness >Max_Avrg_Stiffness
		pv.Sin_z.AvrgStiffness =Max_Avrg_Stiffness
		End
	
	if pv.Sin_z.AvrgStiffness <Min_Avrg_Stiffness
		pv.Sin_z.AvrgStiffness =Min_Avrg_Stiffness
		End
	;>> Ende Limits 
	if pv.SetP_Axle1.shape=2 OR pv.SetP_Axle1.shape=3 ; Sine
		
		pv.PIDz.FFWD_Coef=1 *hub_strain_coeff *var_sin_z_ErrorSpan  ;Amplitude der Vorsteuerung anpassen
		pv.Error_SollIst_z = 1-pv.Istwert_z/pv.Sollwert_z; Echtzeitfehler
		
		Else
		pv.PIDz.FFWD_Coef=(1 / pv.Sin_z.AvrgStiffness)*sin_z_Stellw_FFWD_coeff *hub_strain_coeff  ;Rampen
		pv.Error_SollIst_z = 1-Var_Error_z ; Fehler für P integral nach SteifigkeitsZzklus
			End
	if VB_ADAPT_On=1
		
		pv.PIDz.P=	hub_strain_coeff* pv.PIDz.P_s * (1+ pv.PIDz.Pgain_s * pv.Error_Sollist_z*hub_strain_coeff);+PIDz.P_add
		
		pv.PIDz.I=	hub_strain_coeff* pv.PIDz.I_s / (1+ pv.PIDz.Igain_Errdot_s * Abs(pv.Error_Sollist_z_dot)*hub_strain_coeff)
		
		;PIDz.P_temp= PIDz.P_add + hub_strain_coeff*pv.PIDz.P_s*(hub_strain_coeff*pv.PIDz.Pgain_s * pv.Error_Sollist_z)			
			if pv.PIDz.P > (PIDz_P_lim *hub_strain_coeff)  ; Schutz gegen zu hohe P Adapt
			pv.PIDz.P=(PIDz_P_lim *hub_strain_coeff)
			End
			if pv.PIDz.P < 4*hub_strain_coeff
			pv.PIDz.P =4*hub_strain_coeff
			End
		Else
		pv.PIDz.P=	hub_strain_coeff* pv.PIDz.P_s
		pv.PIDz.I=	hub_strain_coeff* pv.PIDz.I_s
		PIDz.P_add=0
		PIDz.P_temp=0
		End		
	End
	
;FORCE PID tune mode & kein Auto-Test
	if pv.ModeFB_z=3 AND pv.Global_OP_Mode <>2 
	
	pv.Istwert_z = pv.F_axial
	;<< LIMITS FÜR GERECHNETE ADAPT PARAMETER
	
	if sin_z_Stellw_FFWD_coeff >Max_Stellw_FFWD_coeff
		sin_z_Stellw_FFWD_coeff=Max_Stellw_FFWD_coeff
		End
	
	if sin_z_Stellw_FFWD_coeff <Min_Stellw_FFWD_coeff
		sin_z_Stellw_FFWD_coeff=Min_Stellw_FFWD_coeff
		End
		
	if pv.Sin_z.AvrgStiffness >Max_Avrg_Stiffness
		pv.Sin_z.AvrgStiffness =Max_Avrg_Stiffness
		End
	
	if pv.Sin_z.AvrgStiffness <Min_Avrg_Stiffness
		pv.Sin_z.AvrgStiffness =Min_Avrg_Stiffness
		End
	;>> Ende Limits
	pv.PIDz.FFWD_Phase=3.7798*pv.SetP_Axle1.freq -14.048; experimentell zu ermittelt z-Achse mit Sandprobe	
	
	if pv.SetP_Axle1.shape=2 OR pv.SetP_Axle1.shape=3 ; Sine
		
	pv.PIDz.FFWD_Coef= (1/pv.Sin_z.AvrgStiffness)*var_sin_z_ErrorSpan  ;Amplitude der Vorsteuerung anpassen
	pv.Error_SollIst_z = 1-Var_Error_z
		
		Else
		pv.PIDz.FFWD_Coef= (1/pv.Sin_z.AvrgStiffness)* sin_z_Stellw_FFWD_coeff  ;Amplitude der Vorsteuerung anpassen
		pv.Error_SollIst_z = 1-Var_Error_z ; integraler Error
			End
	
		if VB_ADAPT_On=1
		
		pv.PIDz.P=	pv.PIDz.P_F * (1+ pv.PIDz.Pgain_F * pv.Error_Sollist_z);+PIDz.P_add
		pv.PIDz.I=	(pv.PIDz.I_F) / (1+ pv.PIDz.Igain_Errdot_F * Abs(pv.Error_Sollist_z_dot) )
				
		PIDz.P_temp= PIDz.P_add + pv.PIDz.P_F*(pv.PIDz.Pgain_F * pv.Error_Sollist_z)
		
			if pv.PIDz.P > (PIDz_P_lim ) ; Schutz gegen zu hohe P Adapt
			pv.PIDz.P=(PIDz_P_lim )
			End
			if pv.PIDz.P < 1
			pv.PIDz.P = 1
			End
		Else
		pv.PIDz.P=	pv.PIDz.P_F
		pv.PIDz.I=	pv.PIDz.I_F		
		PIDz.P_add=0
		PIDz.P_temp=0
		End		
	End
	
;STRESS mode - PID Tune ODER AutoTest in Stress Mode
	if (pv.ModeFB_z=5 AND pv.Global_OP_Mode <>2)OR(pv.Global_OP_Mode=2 AND pv.SetP_Axle1.mode=1 AND pv.SetP_Axle1.shape<>4)
	
	pv.Istwert_z = pv.Sigma_Axial
	pv.PIDz.FFWD_Phase=3.7798*pv.SetP_Axle1.freq -14.048
	
;<< LIMITS FÜR GERECHNETE ADAPT PARAMETER
	
	if sin_z_Stellw_FFWD_coeff >Max_Stellw_FFWD_coeff
		sin_z_Stellw_FFWD_coeff=Max_Stellw_FFWD_coeff
		End
	
	if sin_z_Stellw_FFWD_coeff <Min_Stellw_FFWD_coeff
		sin_z_Stellw_FFWD_coeff=Min_Stellw_FFWD_coeff
		End
		
	if pv.Sin_z.AvrgStiffness >Max_Avrg_Stiffness
		pv.Sin_z.AvrgStiffness =Max_Avrg_Stiffness
		End
	
	if pv.Sin_z.AvrgStiffness <Min_Avrg_Stiffness
		pv.Sin_z.AvrgStiffness =Min_Avrg_Stiffness
		End
	;>> Ende Limits 	
	
	if pv.SetP_Axle1.shape=2 OR pv.SetP_Axle1.shape=3 ; Sine
		
	pv.PIDz.FFWD_Coef= (1/pv.Sin_z.AvrgStiffness)*var_sin_z_ErrorSpan  *kraft_stress_coeff ;Amplitude der Vorsteuerung anpassen
	pv.Error_SollIst_z = 1-Var_Error_z
		
		Else
		pv.PIDz.FFWD_Coef= (1/pv.Sin_z.AvrgStiffness)* sin_z_Stellw_FFWD_coeff *kraft_stress_coeff  ;Amplitude der Vorsteuerung anpassen
		pv.Error_SollIst_z = 1-Var_Error_z ; integraler Error
			End
	
	Ct_Z.COMin=-10 ; mm/s
	Ct_Z.COMax=10
	
	if VB_ADAPT_On=1
		
		pv.PIDz.P=	kraft_stress_coeff* pv.PIDz.P_F * (1+ pv.PIDz.Pgain_F * pv.Error_Sollist_z*kraft_stress_coeff);+PIDz.P_add
		
		pv.PIDz.I=	(kraft_stress_coeff* pv.PIDz.I_F) / (1+ pv.PIDz.Igain_Errdot_F * Abs(pv.Error_Sollist_z_dot)*kraft_stress_coeff )					
		
		PIDz.P_temp= PIDz.P_add + kraft_stress_coeff*pv.PIDz.P_F*(kraft_stress_coeff*pv.PIDz.Pgain_F * pv.Error_Sollist_z)
		
			if pv.PIDz.P > (PIDz_P_lim *kraft_stress_coeff) ; Schutz gegen zu hohe P Adapt
			pv.PIDz.P=(PIDz_P_lim *kraft_stress_coeff)
			End
			if pv.PIDz.P < 1*kraft_stress_coeff
			pv.PIDz.P = 1*kraft_stress_coeff
			PIDz.P_add=0
			PIDz.P_temp=0
			End
		Else
		pv.PIDz.P=	kraft_stress_coeff* pv.PIDz.P_F
		pv.PIDz.I=	kraft_stress_coeff* pv.PIDz.I_F
		PIDz.P_add=0
		PIDz.P_temp=0
		End		
	End
	
	End
	
	if VB_Setpoint_Static_LR_CMD=1 ; statischer Regler
	pv.Istwert_z = pv.Antrieb_Weg_Z
	
	pv.PIDz.P=	pv.PIDz.P_s
	pv.PIDz.I=	pv.PIDz.I_s
		
	End
		
; REGLER Beschreiben
	Ct_z.Reset=0
	Ct_z.KP =pv.PIDz.P
	Ct_z.KI =pv.PIDz.I
	Ct_z.KD =0
	Ct_z.KV =0
	Ct_z.xInput=pv.PIDz.V*-1
	
	Ct_z.SetPoint=pv.Sollwert_z
	pv.CMD_z=Ct_z.Calc(pv.Istwert_z)
		
	
	VB_Calc_z=0 ; 
End
;>>
; Analog-Ausgänge beschreiben
CMD_Auflast=pv.CMD_z;+ sin_z_CMDoffset ; - Valve Offset
End

5. GPT: It looks like you've provided a significant portion of an Online Famos script related to Z-Axis Control, PID Tuning, Ramp and Sinus Generators, Hydraulics, Safety (Emergency Stop), and various calculation routines. Could you clarify what exactly you need assistance with?
Here are a few things I can do:

Verify Correctness: Check the script for syntax issues, logical errors, or consistency.
Modify for Specific Requirements: Adjust parameters, remove/add features, or refactor specific blocks.
Annotate with Comments: Improve readability by adding clear comments explaining each section.
Compare with Other Code Versions: If you have a previous version, I can compare and highlight differences.
Explain Functionality: If you need a detailed explanation of specific parts, let me know which ones.

Let me know what you'd like me to focus on! 🚀

6. USER: first, verify correctness

7. GPT: I will now verify the correctness of your Online Famos script by checking for:

Syntax Errors: Ensuring all constructs are valid.
Logical Issues: Identifying potential logical inconsistencies.
Best Practices: Ensuring clean, structured, and efficient code.
Redundant or Unused Variables: Checking for unnecessary declarations or duplicate assignments.

I will now begin the verification process.

I have identified several syntax issues, potential logical errors, and redundant/unused variables in your Online Famos script. You can now review the detailed verification report for specific lines that may need corrections. Let me know if you need assistance in fixing any of these issues! 🚀 ​​

8. USER: open a canvas and show where there are problems.

9. GPT: I have highlighted the syntax issues, logical concerns, and redundant variables in your Online Famos script on the canvas. Let me know if you want me to apply corrections directly or if you need further explanations on any issue! 🚀

