const rowInput = document.getElementById("row-input");
const baseStitchesSelect = document.getElementById("base-stitches");
const staggerCheck = document.getElementById("stagger-check");
const decBtn = document.getElementById("dec-btn");
const incBtn = document.getElementById("inc-btn");
const resetChecksBtn = document.getElementById("reset-checks-btn");
const targetSummary = document.getElementById("target-summary");
const patternTbody = document.getElementById("pattern-tbody");

// 完了チェック状態を段数ごとに保持
const checkedRows = new Set();

/**
 * 指定された段数(row)の編み方パターンと合計目数を計算する
 * @param {number} row - 段数 (1以上)
 * @param {number} base - 1段目の作り目数 (通常6)
 * @param {boolean} stagger - 偶数段の増やし目を分散させるか
 */
function calculateRowData(row, base, stagger) {
  const totalStitches = base * row;

  if (row === 1) {
    return {
      row,
      pattern: `わの作り目に細編み ${base}回`,
      repeatCount: 1,
      totalStitches,
      type: "base",
      note: "輪の作り目をして、立ち上がり鎖1目を編んでから細編みを編みます。"
    };
  }

  if (row === 2) {
    return {
      row,
      pattern: `（増やし目） × ${base}回`,
      repeatCount: base,
      totalStitches,
      type: "even",
      note: "前段のすべての目に2目ずつ細編みを編み入れます。"
    };
  }

  // 3段目以降：1ブロックあたりの通常の細編み回数 = row - 2
  const singleCount = row - 2;
  const isEven = row % 2 === 0;

  // 偶数段かつ分散増し目がONの場合：細編みを半分ずつ前後に分ける
  // 例: 4段目 (singleCount = 2) -> 細編み1回 → 増やし目 → 細編み1回
  // 例: 6段目 (singleCount = 4) -> 細編み2回 → 増やし目 → 細編み2回
  if (isEven && stagger) {
    const half = singleCount / 2;
    const scLabel = half === 1 ? "細編み" : `細編み ${half}回`;
    return {
      row,
      pattern: `（${scLabel} → 増やし目 → ${scLabel}） × ${base}回`,
      repeatCount: base,
      totalStitches,
      type: "even",
      note: `偶数段のため増やし目の位置をずらし、角ができないきれいな円にします（1ブロック計${row}目）。`
    };
  }

  // 奇数段、または分散OFFの場合
  // 例: 3段目 (singleCount = 1) -> 細編み → 増やし目
  // 例: 5段目 (singleCount = 3) -> 細編み 3回 → 増やし目
  const scLabel = singleCount === 1 ? "細編み" : `細編み ${singleCount}回`;
  return {
    row,
    pattern: `（${scLabel} → 増やし目） × ${base}回`,
    repeatCount: base,
    totalStitches,
    type: isEven ? "even" : "odd",
    note: `「${scLabel}」と「増やし目」のセットを${base}回繰り返します（1ブロック計${row}目）。`
  };
}

function render() {
  let targetRow = parseInt(rowInput.value, 10);
  if (isNaN(targetRow) || targetRow < 1) {
    targetRow = 1;
    rowInput.value = 1;
  } else if (targetRow > 50) {
    targetRow = 50;
    rowInput.value = 50;
  }

  const base = parseInt(baseStitchesSelect.value, 10);
  const stagger = staggerCheck.checked;

  // 目標段のサマリー表示
  const targetData = calculateRowData(targetRow, base, stagger);
  targetSummary.innerHTML = `
    <div class="summary-header">
      <span class="summary-title">${targetData.row}段目の編み方</span>
      <span class="summary-total">1周の合計：${targetData.totalStitches}目</span>
    </div>
    <div class="summary-pattern">${targetData.pattern}</div>
    <p class="summary-note">${targetData.note}</p>
  `;

  // 1段目から目標段までの一覧テーブル生成
  patternTbody.innerHTML = "";
  for (let r = 1; r <= targetRow; r++) {
    const data = calculateRowData(r, base, stagger);
    const tr = document.createElement("tr");

    if (r === targetRow) {
      tr.classList.add("highlight-row");
    }
    if (checkedRows.has(r)) {
      tr.classList.add("checked-row");
    }

    let badgeHtml = "";
    if (r > 1) {
      badgeHtml = data.type === "even"
        ? `<span class="badge badge-even">偶数</span>`
        : `<span class="badge badge-odd">奇数</span>`;
    }

    tr.innerHTML = `
      <td class="col-check">
        <input type="checkbox" data-row="${r}" ${checkedRows.has(r) ? "checked" : ""}>
      </td>
      <td class="col-row">${r}段目${badgeHtml}</td>
      <td class="col-pattern">${data.pattern}</td>
      <td class="col-total">${data.totalStitches}目</td>
    `;

    const checkbox = tr.querySelector('input[type="checkbox"]');
    checkbox.addEventListener("change", (e) => {
      if (e.target.checked) {
        checkedRows.add(r);
        tr.classList.add("checked-row");
      } else {
        checkedRows.delete(r);
        tr.classList.remove("checked-row");
      }
    });

    patternTbody.appendChild(tr);
  }
}

// イベントリスナー設定
rowInput.addEventListener("input", render);
baseStitchesSelect.addEventListener("change", render);
staggerCheck.addEventListener("change", render);

decBtn.addEventListener("click", () => {
  const current = parseInt(rowInput.value, 10) || 1;
  if (current > 1) {
    rowInput.value = current - 1;
    render();
  }
});

incBtn.addEventListener("click", () => {
  const current = parseInt(rowInput.value, 10) || 1;
  if (current < 50) {
    rowInput.value = current + 1;
    render();
  }
});

resetChecksBtn.addEventListener("click", () => {
  checkedRows.clear();
  render();
});

// 初期描画
render();
