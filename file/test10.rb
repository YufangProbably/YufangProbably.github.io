def customize_ppt notes, times
  times = times.ring
  notes.each_index do |i|
    yield notes [i], times [i]
  end
end

use_bpm 160

tabamashi_note = [
  69, 64, 69, 71, 69, 71,
  72, 76, 71, 67,
  69, 65, 69, 67, 64, 67,
  64, 62, 64, 69, 71,
  69, 67, 64, 62, 62, 67,
  64, 62, 64, 67,
  69, 67, 69, 71, 72, 76,
  71, 72, 71, 69, 67
]
tabamashi_time = [
  2, 1, 1, 2, 1, 1,
  2, 2, 2, 2,
  2, 1, 1, 2, 1, 1,
  2, 2, 2, 1, 1,
  2, 1, 2, 1, 1, 1,
  2, 2, 2, 2,
  2, 1, 2, 1, 1, 2,
  1, 1, 1, 2, 2
]

bad_apple_note = [
  69, 69, 71, 72, 71, 64, 71,
  71, 72, 69, 67, 67, 69, 64, 69,
  69, 69, 71, 72, 71, 72, 74,
  69, 76, 76, 74, 76, 79,
  69+12, 69+12, 71+12, 72+12, 71+12, 64+12, 71+12,
  71+12, 72+12, 69+12, 67+12, 67+12, 69+12, 64+12, 83,
  81, 81, 83, 84, 86, 83, 84, 86,
  81, 76, 88, 86, 84, 83, 84
]
bad_apple_time = [
  4, 1, 1, 2, 3, 3, 2,
  2, 1, 3, 2, 2, 1, 3, 2,
  4, 1, 1, 2, 3, 3, 2,
  3, 1, 8, 1, 1, 2,
  4, 1, 1, 2, 3, 3, 2,
  2, 1, 3, 2, 2, 1, 3, 2,
  4, 1, 1, 1, 1, 3, 3, 2,
  3, 3, 2, 2, 2, 2, 2
]

in_thread do
  (32 * 2).times do
    sample :drum_bass_soft
    sleep 1
    synth :sc808_clap, amp: 0.75
    sleep 1.5
    sample :drum_bass_soft
    sleep 0.5
    synth :sc808_clap, amp: 0.75
    sleep 1
  end
end
in_thread do
  (4 * 2).times do
    sleep 29.5
    sample :drum_bass_soft
    sleep 0.25
    sample :drum_bass_soft
    sleep 0.25
    4.times do
      synth :sc808_clap, amp: 0.75
      sleep 0.5
    end
  end
end
in_thread do
  (256 * 2).times do
    sample :drum_cymbal_closed, amp: 3 / 16.0
    sleep 0.5
  end
end

in_thread do
  use_synth :bass_foundation
  (8 * 2).times do
    customize_ppt [
      69, 69, 69,
      72, 72, 72,
      65, 65, 65,
      67, 67, 67,
    ], [
      3, 2, 3
    ] do |note, time|
      play note - 24, release: 1.5, sustain: 0, amp: 0.25
      sleep time / 2.0
    end
  end
  play 69-24, release: 0, sustain: 1, amp: 0.25
end

in_thread do
  use_synth :piano
  sleep 1
  (8 * 2).times do
    customize_ppt [
      [69, 72, 76], [69, 72, 76],
      [67, 72, 76], [67, 72, 76],
      [65, 69, 72], [65, 69, 72],
      [67, 69, 72], [67, 69, 72],
    ], [
      3, 5
    ] do |note, time|
      note.each do |i| play i, release: 0, sustain: 1, amp: 3 / 16.0 end
      sleep time / 2.0
    end
  end
end

in_thread do
  use_synth :subpulse
  sleep 126
  play 69, sustain: 2.0 - 0.125, amp: 0.25, attack: 2, note_slide: 2
  sleep 2
  customize_ppt bad_apple_note, bad_apple_time do |note, time|
    play note, release: 0.25, sustain: time / 2.0 - 0.125, amp: 0.375
    sleep time / 2.0
  end
end

in_thread do
  sleep 64
  use_synth :organ_tonewheel
  customize_ppt tabamashi_note * 4, tabamashi_time * 4 do |note, time|
    play note, release: 0.25, sustain: time / 2.0 - 0.125, amp: 0.75
    sleep time / 2.0
  end
end