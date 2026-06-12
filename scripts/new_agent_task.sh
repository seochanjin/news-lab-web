#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
사용법: scripts/new_agent_task.sh <branch-name> <task-title>
예시: scripts/new_agent_task.sh feature/article-filters "기사 필터 UI"

프론트엔드 workflow 문서만 생성한다. Branch를 생성하거나 전환하지 않는다.
USAGE
}

if [ "$#" -ne 2 ]; then
  usage >&2
  exit 1
fi

branch_name="$1"
task_title="$2"

if [[ -z "$branch_name" || -z "$task_title" ]]; then
  echo "오류: branch 이름과 task 제목은 비어 있을 수 없습니다." >&2
  exit 1
fi

if [[ ! "$branch_name" =~ ^[A-Za-z0-9._/-]+$ ]] ||
  [[ "$branch_name" == /* ]] ||
  [[ "$branch_name" == */ ]] ||
  [[ "$branch_name" == *//* ]] ||
  [[ "$branch_name" == *..* ]]; then
  echo "오류: branch 이름에 안전하지 않은 파일명 문자 또는 경로 조각이 포함되어 있습니다." >&2
  exit 1
fi

if ! git check-ref-format --branch "$branch_name" >/dev/null 2>&1; then
  echo "오류: 유효한 git branch 이름이 아닙니다." >&2
  exit 1
fi

safe_name="${branch_name//\//-}"

files=(
  "docs/tasks/${safe_name}.md"
  "docs/pr/${safe_name}.md"
  "docs/devlog/${safe_name}.md"
  "docs/reviews/${safe_name}-antigravity.md"
  "docs/reviews/${safe_name}-coderabbit.md"
  "docs/fixes/${safe_name}-approved-fixes.md"
  "docs/verification/${safe_name}.md"
)

for file in "${files[@]}"; do
  if [[ -e "$file" ]]; then
    echo "오류: 기존 workflow 파일을 덮어쓰지 않습니다: $file" >&2
    exit 1
  fi
done

mkdir -p docs/tasks docs/pr docs/devlog docs/reviews docs/fixes docs/verification

cat > "docs/tasks/${safe_name}.md" <<TASK
# 작업: ${task_title}

## 목표

## 프론트엔드 작업 범위

## 변경하지 않을 항목

- Backend API code, DB, Supabase SQL, K3s, Docker, production infrastructure, secret, \`.env\`, \`.env.*\`
- \`git push\`, \`git merge\`, production deploy command, production-impacting command를 실행하지 않는다.

## 예상 변경 파일

## 컴포넌트 / Route / API client 영향

## 상태 처리

## 스타일 / 반응형 / 접근성

## 검증 Command

## 수동 브라우저 검증

## 완료 조건

## 참고 사항
TASK

cat > "docs/pr/${safe_name}.md" <<PR
# ${task_title}

## 작업 내용

## 주요 변경 사항

## 프론트엔드/API 영향

## 상태 및 UX 영향

## README 영향

## 테스트

## 확인 결과

## 비고
PR

cat > "docs/devlog/${safe_name}.md" <<DEVLOG
# ${task_title}

## 작업 목적

## 기존 문제

## 변경 내용

## 구현 상세

## 대안 검토

## 선택한 접근과 근거

## 트레이드오프

## 테스트 및 브라우저 확인

## 운영 반영

## README 업데이트 판단

## 확인 결과

## 이번 단계의 의미

## 포트폴리오용 요약

## 다음 단계 후보
DEVLOG

for reviewer in antigravity coderabbit; do
  reviewer_title="Antigravity"
  if [[ "$reviewer" == "coderabbit" ]]; then
    reviewer_title="CodeRabbit"
  fi

  cat > "docs/reviews/${safe_name}-${reviewer}.md" <<REVIEW
# ${reviewer_title} 검토: ${task_title}

## 검토 요약

## 요구사항 충족

## 코드 품질과 유지보수성

## 프론트엔드 동작과 접근성

## 보안과 범위 검토

## 검증 기록 검토

## 문서 검토

## 발견된 문제

## PR 전 필수 수정

## 선택 개선 사항

## 제안 검증 Command

## 최종 판단
REVIEW
done

cat > "docs/fixes/${safe_name}-approved-fixes.md" <<FIXES
# 승인된 수정: ${task_title}

## 사람 승인 대기 중인 수정 후보

## 승인된 수정

## 거절 또는 보류한 제안

## 적용한 변경

## 필요한 검증
FIXES

cat > "docs/verification/${safe_name}.md" <<VERIFY
# 검증 기록: ${task_title}

## 검증 범위

## 실행한 Command

## 결과

## 수동 브라우저 검증

## 대기 중인 검증

## 근거 메모
VERIFY

printf '%s용 프론트엔드 workflow 문서를 생성했습니다:\n' "$branch_name"
printf -- '- %s\n' "${files[@]}"
