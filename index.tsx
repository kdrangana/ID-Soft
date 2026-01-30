  const inspectorDragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });
  const inspectorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeDesignation = designations.find(d => d.title === data.designation);
  const activeGrade = grades.find(g => g.title === data.grade);
  
  const isStandardSelection = selectedElementId && selectedElementId.startsWith('std_');
  const selectedStandardKey = isStandardSelection ? selectedElementId!.replace('std_', '') : null;
  
  const selectedStyle: TextStyle | undefined = isStandardSelection
      ? standardStyles[selectedStandardKey!]
      : customElements.find(el => el.id === selectedElementId);

  useEffect(() => {
        if (editingElementId) {
            const el = document.getElementById(`editable-text-${editingElementId}`);
            if (el) {
                el.focus();
            }
        }
  }, [editingElementId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (key: keyof typeof images) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setImages(prev => ({ ...prev, [key]: result }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };
  
  const handleGenerateCard = () => {
      const newCard = { ...data, id: Date.now().toString() };
      setGeneratedCards(prev