# SeaSentinel

[![Deploy Status](https://github.com/cywf/SeaSentinel/actions/workflows/pages.yml/badge.svg)](https://github.com/cywf/SeaSentinel/actions/workflows/pages.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

SeaSentinel: An Intrusion Detection System (IDS) designed to enhance the security of GMDSS maritime communications, monitoring for unauthorized access and anomalies.

🌐 **[View Documentation Site](https://cywf.github.io/SeaSentinel/)**

## Overview

SeaSentinel provides comprehensive security monitoring for the Global Maritime Distress and Safety System (GMDSS), covering:

- **DSC (Digital Selective Calling)**: Monitor distress alerts and detect unauthorized transmissions
- **NAVTEX**: Validate navigational warnings and safety broadcasts
- **AIS/NMEA**: Detect spoofed vessel identities and anomalous position reports
- **Voice Communications**: Analyze maritime voice channels for suspicious activity

## Documentation Site

Visit our comprehensive documentation site at **[https://cywf.github.io/SeaSentinel/](https://cywf.github.io/SeaSentinel/)** to explore:

### Available Pages

- **[Home](https://cywf.github.io/SeaSentinel/)** - Project overview and quick links
- **[Rulebook Explorer](https://cywf.github.io/SeaSentinel/rulebook)** - Browse detection rules, signatures, and playbooks
- **[Statistics](https://cywf.github.io/SeaSentinel/statistics)** - Repository metrics and contribution stats
- **[Discussions](https://cywf.github.io/SeaSentinel/discussions)** - Community conversations
- **[Development Board](https://cywf.github.io/SeaSentinel/development-board)** - Project roadmap and tasks
- **[Create Issue](https://cywf.github.io/SeaSentinel/create-issue)** - Report bugs or request features
- **[Docs](https://cywf.github.io/SeaSentinel/docs)** - Full documentation and GMDSS primer
- **[Visualizer](https://cywf.github.io/SeaSentinel/visualizer)** - System architecture diagrams

## Rulebook Structure

The rulebook system uses the following folder conventions:

```
rules/
├── dsc_rules.yml         # DSC protocol detection rules
├── navtex_rules.yml      # NAVTEX protocol rules
└── ais_rules.yml         # AIS/NMEA rules

signatures/
├── dsc_signatures.yml    # DSC signature patterns
├── navtex_signatures.yml # NAVTEX patterns
└── voice_patterns.yml    # Voice analysis patterns

playbooks/
├── isolation.md          # Isolation procedures
├── triage.md            # Triage steps
└── notification.md      # Notification protocols
```

### Rule Format Example

```yaml
id: dsc-unauthorized-distress
name: Unauthorized DSC Distress Alert
severity: critical
protocol: DSC
description: Detects DSC distress calls from unknown or blacklisted MMSIs
match:
  category: distress
  format: geographic-area
```

### How Indexes Are Generated

The documentation site automatically generates rulebook indexes during CI/CD:

1. **Rules Index** (`site/scripts/index_rules.ts`) - Parses `rules/**/*.{yml,yaml,json}`
2. **Signatures Index** (`site/scripts/index_signatures.ts`) - Parses `signatures/**/*.{yml,yaml,json}`
3. **Playbooks Index** (`site/scripts/index_playbooks.ts`) - Parses `playbooks/**/*.{md,markdown}`

All parsing is best-effort and does not require secrets. Data is generated at build time and served statically.

## Contributing

We welcome contributions! Please see our [issue templates](.github/ISSUE_TEMPLATE/) for:

- **Bug Reports** - Report issues you encounter
- **Feature Requests** - Suggest new capabilities
- **Documentation** - Help improve our docs

## License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.

## Security

SeaSentinel is a security monitoring tool. All monitoring must comply with:
- Applicable maritime regulations
- Radio licensing requirements
- Privacy laws and data protection regulations

**Never monitor communications without proper authorization.**
