# Pretrained model review

> **Status: IMPLEMENTATION (NASA Space Apps 2026, started 14 Nov 2026 00:00 ICT; authorized by project owner Trung).**

Access/review 2026-11-13. Documentation reviewed; no weights, inference, training,
compute benchmark or NISAR performance test. **No pretrained model in mandatory MVP.**

| Field | TerraMind | SAM 2 | Prithvi-EO-2.0 |
|---|---|---|---|
| Assessed version | `TerraMind-1.0-base` / `terramind_v1_base` | `sam2.1_hiera_tiny`, 2024-09-29 checkpoint release | `Prithvi-EO-2.0-300M`, non-TL |
| Developer | IBM, ESA, Forschungszentrum Jülich | Meta | IBM, NASA, Jülich Supercomputing Centre |
| Official evidence | [Card](https://huggingface.co/ibm-esa-geospatial/TerraMind-1.0-base), [repo](https://github.com/IBM/terramind) | [Repo/checkpoints](https://github.com/facebookresearch/sam2) | [Card](https://huggingface.co/ibm-nasa-geospatial/Prithvi-EO-2.0-300M), [NASA repo](https://github.com/NASA-IMPACT/Prithvi-EO-2.0) |
| Weights / code license | Card Apache-2.0; IBM repo Apache-2.0 | README explicitly Apache-2.0 code/checkpoints; bundled components require notices | Card Apache-2.0 weights; NASA release repo MIT; distinguish them |
| Inputs | S2L2A/S2L1C, S1GRD/S1RTC, DEM, RGB among documented modalities | Prompted images/video | Six-band multitemporal optical HLS V2 |
| NISAR compatibility | Sentinel-1 documented; NISAR unestablished | No radar measurement contract | No SAR input contract |
| Preprocessing | Match modality, quantity/channels/sampling/mask/normalization; S1 constants not portable to NISAR | Tensor/resize/3-channel image normalization; SAR rendering adds unvalidated choices | Blue/green/red/narrow NIR/SWIR1/SWIR2 reflectance, band order, normalization/time/mask; published configuration six channels, 224 size, four frames |
| Approximate compute | Listed base checkpoint ~1.52 GB; PyTorch; workload RAM/VRAM unknown | 38.9M parameters ≈156 MB FP32 parameters only; activations/runtime extra; A100 benchmark not a local estimate | Listed checkpoint ~1.33 GB; 300M FP32 parameters ≈1.2 GB excluding runtime |
| Limits | Domain/sensor transfer; backbone not validated NISAR water classifier; generated modalities are estimates | Visual object masks do not establish radar change/flood truth | Optical-to-SAR mismatch; pretraining not task validation |
| Benefit over baseline | Possible context/segmentation, unproven here | Possible assisted annotation, unproven for physical interpretation | Possible optical context, no direct SAR benefit shown |
| Recommendation | Defer to P2 evidence-gated research | Exclude mandatory analysis; annotation optional | Exclude direct NISAR analysis |

Sizes are file listings, not downloads or measured memory. Freeze exact repository
revisions/checkpoint hashes before any future adoption. Evidence for preprocessing:
[TerraMind configuration](https://github.com/IBM/terramind/blob/main/configs/terramind_v1_base_sen1floods11.yaml),
[SAM transforms](https://github.com/facebookresearch/sam2/blob/main/sam2/utils/transforms.py),
[Prithvi config](https://huggingface.co/ibm-nasa-geospatial/Prithvi-EO-2.0-300M/blob/main/config.json).
[TerraMind files](https://huggingface.co/ibm-esa-geospatial/TerraMind-1.0-base/tree/main),
[Prithvi files](https://huggingface.co/ibm-nasa-geospatial/Prithvi-EO-2.0-300M/tree/main),
[Prithvi repository license](https://github.com/NASA-IMPACT/Prithvi-EO-2.0/blob/main/LICENSE).

Sentinel-1 C-band commonly supplies VV/VH; NISAR instrument bands and polarization
modes differ. Actual selected channels remain unknown.
[Sentinel-1](https://sentiwiki.copernicus.eu/web/s1-mission),
[NISAR polarimetry](https://science.nasa.gov/mission/nisar/polarimetry/).
Scientific inference: renaming HH/HV to VV/VH, borrowing S1 normalization or rendering
similar RGB does not establish NISAR compatibility. Wavelength, polarization,
geometry, radiometry and vegetation responses shift distributions. Generated
modalities cannot serve as independent observational corroboration.

Baseline: scientifically compatible calibrated diagonal-power comparison with
shared valid support and explainable signed log-ratio/dB difference. It is not
automatic flood truth. Optional model adoption needs a NISAR input/task-head
contract, independent dated labels, event/spatial evaluation separation and prior
exposure disclosure, identical baseline support, suitable metrics and failure
examples, reference uncertainty, measured resources, frozen preprocessing/revisions
and license notices. If evidence is absent, omit the model. No improvement or
confidence number is claimed.
