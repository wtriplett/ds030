## UCLA Consortium for Neuropsychiatric Phenomics LA5c Study

## Feedback and Discussion of Dataset DS000030

Feedback, discussions, and comments are welcome. For information on how and where to discuss this data set, please see the OpenfMRI FAQ: https://openfmri.org/faq/ item "**Is there a place to discuss these datasets with the larger community?**"

## Data Organization

The data set is organized in BIDS version 1.0.0rc3 (http://bids.neuroimaging.io) format.

## Subjects / Participants
The participants.tsv file contains subject IDs with demographic informations as well as an inventory of the scans that are included for each subject.

## Dataset Derivatives (/derivatives)
The /derivaties folder contains summary information that reflects the data and its contents:

1. Final_Scan_Count.pdf - Plot showing the over all scan inclusion, for quick reference.
2. parameter_plots/ - Folder contains many scan parameters plotted over time. Plot symbols are color coded by imaging site. Intended to provide a general sense of protocol adherence throughout the study. Individual parameters scan be found in the scan .json sidecar file. A single file containing the combined data from all of the imaging .json sidecars if provided in parameter_plots/MR_Scan_Parameters.tsv file.
3. physio_plots/ - Folder contains a plot of the physiological recording trace for the Breath Hold and Resting State functional scans. For the BHT, the instructional cue timings are represented by shaded background.
4. event_plots/ - Simple plots of the function task events files. The x-axis is always time (onset), and the y-axis can be task-specific. Also intended as a quick reference or summary.
5. mriqcp/ - Output of the current version (as of 27 Jan 2016) of MRIQCP (MRI Quality Control Protocol: https://github.com/poldracklab/mriqc). Included are numeric results of anatomical and functional protocols as well as single subject results plotted against group distribution.

## Scan-specific Notes

All scan files were converted from scanner DICOM files using dcm2niix (0c9e5c8 from https://github.com/neurolabusc/dcm2niix.git). Extra DICOM metadata elements were extracted using GDCM (http://gdcm.sourceforge.net/wiki/index.php/Main_Page) and combined to form each scan's .json sidecar.

**Note regarding scan and task timing**: In most cases, the trigger time was provided in the task data file and has been transferred into the TaskParameter section of each scans *_bold.json file. If the trigger time is available, a correction was performed to the onset times to account for trigger delay. The uncompensated onset times are included in the onset_NoTriggerAdjust column. There will be an 8 second discrepancy between the compensated and uncompensated that accounts for pre-scans (4 TRs) performed by the scanner. In the cases where the trigger time is not available, the output of (TotalScanTime - nVols*RepetitionTime) may provide an estimate of pre-scan time.

### T1w Anatomical
Defacing was performed using freesurfer mri_deface (https://surfer.nmr.mgh.harvard.edu/fswiki/mri_deface)

    Bischoff-Grethe, Amanda et al. "A Technique for the Deidentification of Structural Brain MR Images." Human brain mapping 28.9 (2007): 892–903. PMC. Web. 27 Jan. 2016.

### PAMenc / PAMret
The larger amount of missing PAM scans is due to a task design change early in the study. It was decided that data collected before the design change would be excluded.

### Stop Signal
The Stop Signal task consisted of both a training task (no MRI) and the in-scanner fMRI task. The data from the training run is included in each subject's beh folder with the task name "stopsignaltraining".

