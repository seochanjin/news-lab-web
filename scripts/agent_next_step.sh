#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
사용법: scripts/agent_next_step.sh <command>

Commands:
  files
  codex-implement
  antigravity-review
  antigravity-review-write
  fixes-draft
  codex-apply-fixes
  pr-draft
  devlog-draft
USAGE
}

branch_name() {
  git branch --show-current
}

safe_name() {
  printf '%s' "${1//\//-}"
}

print_context() {
  local branch="$1"
  local safe="$2"

  cat <<EOF
현재 branch: ${branch}
안전한 branch 이름: ${safe}

Workflow 파일:
- Task: docs/tasks/${safe}.md
- Antigravity review: docs/reviews/${safe}-antigravity.md
- CodeRabbit review: docs/reviews/${safe}-coderabbit.md
- 승인된 수정: docs/fixes/${safe}-approved-fixes.md
- 검증 기록: docs/verification/${safe}.md
- PR 초안: docs/pr/${safe}.md
- Devlog: docs/devlog/${safe}.md
EOF
}

print_common_rules() {
  cat <<'EOF'
공통 규칙:
- 이 저장소는 NewsLab 프론트엔드 저장소다. 프론트엔드 작업 범위를 유지한다.
- docs/tasks/<safe-branch>.md를 작업 요구사항의 source of truth로 사용한다.
- backend API code, DB, Supabase SQL, K3s, Docker, production infrastructure, secret, .env, .env.*를 수정하지 않는다.
- git push, git merge, production deploy command, production-impacting command를 실행하지 않는다.
- 실제 기록된 근거 없이 deployment, production verification, PR merge, browser verification 완료를 주장하지 않는다.
- 실제 실행한 command와 결과만 docs/verification/<safe-branch>.md에 기록한다.
- PR과 devlog 초안은 review 주장이 아니라 verification 기록을 검증 근거로 사용한다.
- Review 결과만으로 수정을 승인하지 않는다. 승인된 수정 아래에 사람이 승인한 항목만 적용한다.
- 이 helper는 prompt만 출력한다. Agent, GitHub, test, browser tool, deployment를 실행하지 않는다.
EOF
}

print_codex_implement() {
  local branch="$1"
  local safe="$2"

  cat <<EOF
현재 NewsLab Web 프론트엔드 task를 구현한다.

읽을 파일:
- AGENTS.md
- docs/ARCHITECTURE.md
- docs/RUNBOOK.md
- docs/prompts/codex-implement.md
- docs/tasks/${safe}.md

현재 branch:
- ${branch}

기준 문서:
- docs/tasks/${safe}.md

$(print_common_rules)

구현 중점 항목:
- Task의 프론트엔드 작업 범위, 제외 항목, 예상 변경 파일, 검증 command, acceptance criteria를 따른다.
- Next.js 코드를 변경하기 전에 node_modules/next/dist/docs의 관련 가이드를 읽는다.
- 관련 component, route, API client, styling, loading/error/empty state, responsive, accessibility, browser 영향을 검토한다.
- 변경을 작고 검토 가능하게 유지한다.
- 실제 검증 결과를 docs/verification/${safe}.md에 기록한다.

구현 후 변경 파일, 동작, 검증 command와 결과, 제외한 영역, 남은 수동 작업을 요약한다.
EOF
}

print_antigravity_review() {
  local branch="$1"
  local safe="$2"

  cat <<EOF
현재 NewsLab Web 프론트엔드 변경을 review하고 chat에만 결과를 출력한다.

읽을 파일:
- AGENTS.md
- docs/ARCHITECTURE.md
- docs/prompts/antigravity-review.md
- docs/tasks/${safe}.md
- docs/verification/${safe}.md
- 현재 git diff

현재 branch:
- ${branch}

$(print_common_rules)

Component, routing, rendering, API client, 상태 UI, styling, responsive, accessibility, 범위 통제, secret 노출, 검증 기록 무결성, 문서 위험을 검토한다. 파일은 수정하지 않는다.

docs/prompts/antigravity-review.md에 정의된 출력 형식을 사용한다.
EOF
}

print_antigravity_review_write() {
  local branch="$1"
  local safe="$2"

  cat <<EOF
현재 NewsLab Web 프론트엔드 변경의 Antigravity review를 작성한다.

읽을 파일:
- AGENTS.md
- docs/ARCHITECTURE.md
- docs/prompts/antigravity-review.md
- docs/tasks/${safe}.md
- docs/verification/${safe}.md
- 현재 git diff

현재 branch:
- ${branch}

수정 가능한 유일한 파일:
- docs/reviews/${safe}-antigravity.md

$(print_common_rules)

Finding만 기록한다. Fix를 적용하거나 새로운 verification 결과를 기록하지 않는다. docs/prompts/antigravity-review.md에 정의된 출력 형식을 사용한다.
EOF
}

print_fixes_draft() {
  local branch="$1"
  local safe="$2"

  cat <<EOF
현재 NewsLab Web 프론트엔드 branch의 수정 후보 초안을 작성한다.

읽을 파일:
- AGENTS.md
- docs/tasks/${safe}.md
- docs/reviews/${safe}-antigravity.md
- docs/reviews/${safe}-coderabbit.md
- 현재 git diff

현재 branch:
- ${branch}

출력 파일:
- docs/fixes/${safe}-approved-fixes.md

$(print_common_rules)

Fix를 적용하지 않는다. 승인되지 않은 제안은 사람 승인 대기 중인 수정 후보 아래에 둔다. 결과를 만들어내지 않고 approved, rejected/deferred, applied, verification-required 항목을 구분한다.
EOF
}

print_codex_apply_fixes() {
  local branch="$1"
  local safe="$2"

  cat <<EOF
현재 NewsLab Web 프론트엔드 branch의 승인된 수정을 적용한다.

읽을 파일:
- AGENTS.md
- docs/prompts/codex-implement.md
- docs/tasks/${safe}.md
- docs/fixes/${safe}-approved-fixes.md
- docs/verification/${safe}.md

현재 branch:
- ${branch}

$(print_common_rules)

승인된 수정 아래에 명시된 항목만 적용한다. Candidate, rejected, deferred, raw review suggestion은 적용하지 않는다. 적용한 변경은 fixes 문서에, 실제 검증은 docs/verification/${safe}.md에 기록한다.
EOF
}

print_pr_draft() {
  local branch="$1"
  local safe="$2"

  cat <<EOF
현재 NewsLab Web 프론트엔드 branch의 PR 초안을 작성한다.

읽을 파일:
- AGENTS.md
- docs/prompts/pr-draft.md
- docs/tasks/${safe}.md
- docs/fixes/${safe}-approved-fixes.md
- docs/verification/${safe}.md
- 현재 git diff

현재 branch:
- ${branch}

출력 파일:
- docs/pr/${safe}.md

$(print_common_rules)

docs/prompts/pr-draft.md의 필수 섹션과 규칙을 따른다. 프론트엔드 동작과 범위를 정확하게 기록하고 수행하지 않은 검증은 pending으로 남긴다.
EOF
}

print_devlog_draft() {
  local branch="$1"
  local safe="$2"

  cat <<EOF
현재 NewsLab Web 프론트엔드 branch의 작업 기록 초안을 작성한다.

읽을 파일:
- AGENTS.md
- docs/ARCHITECTURE.md
- docs/prompts/worklog-draft.md
- docs/tasks/${safe}.md
- docs/pr/${safe}.md
- docs/fixes/${safe}-approved-fixes.md
- docs/verification/${safe}.md
- 사람이 제공한 manual verification 로그가 있다면 해당 로그

현재 branch:
- ${branch}

출력 파일:
- docs/devlog/${safe}.md

$(print_common_rules)

docs/prompts/worklog-draft.md의 필수 섹션과 규칙을 따른다. 모든 검증 주장은 verification 문서 또는 사람이 제공한 로그를 근거로 작성한다.
EOF
}

main() {
  if [[ "$#" -ne 1 ]]; then
    usage >&2
    exit 1
  fi

  local command="$1"
  local branch
  branch="$(branch_name)"

  if [[ -z "$branch" ]]; then
    echo "오류: 현재 git branch를 확인할 수 없습니다." >&2
    exit 1
  fi

  local safe
  safe="$(safe_name "$branch")"

  case "$command" in
    files)
      print_context "$branch" "$safe"
      ;;
    codex-implement)
      print_codex_implement "$branch" "$safe"
      ;;
    antigravity-review)
      print_antigravity_review "$branch" "$safe"
      ;;
    antigravity-review-write)
      print_antigravity_review_write "$branch" "$safe"
      ;;
    fixes-draft)
      print_fixes_draft "$branch" "$safe"
      ;;
    codex-apply-fixes)
      print_codex_apply_fixes "$branch" "$safe"
      ;;
    pr-draft)
      print_pr_draft "$branch" "$safe"
      ;;
    devlog-draft)
      print_devlog_draft "$branch" "$safe"
      ;;
    -h|--help|help)
      usage
      ;;
    *)
      echo "오류: 알 수 없는 command입니다: $command" >&2
      usage >&2
      exit 1
      ;;
  esac
}

main "$@"
