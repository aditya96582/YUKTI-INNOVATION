import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useMedical } from "@/contexts/MedicalContext";
import { useNotifications } from "@/contexts/NotificationContext";
import Navbar from "@/components/Navbar";
import { Pill, Plus, MapPin, Clock, FileImage, Scan, CheckCircle, Store, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TrustRating from "@/components/TrustRating";

const Medical = () => {
  const { currentUser, isAuthenticated, addTokens, incrementHelps } = useAuth();
  const { medicalRequests, addMedicalRequest, pharmacyRespond } = useMedical();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', quantity: '' }]);
  const [location, setLocation] = useState('');
  const [prescriptionImage, setPrescriptionImage] = useState<string>('');
  const [scanning, setScanning] = useState(false);
  const prescriptionInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => { if (!isAuthenticated) navigate('/auth'); }, [isAuthenticated]);

  const addMedRow = () => setMedicines([...medicines, { name: '', dosage: '', quantity: '' }]);
  const updateMed = (i: number, field: string, value: string) => {
    const updated = [...medicines];
    (updated[i] as any)[field] = value;
    setMedicines(updated);
  };

  const handlePrescriptionUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPrescriptionImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleOCR = async () => {
    setScanning(true);
    await new Promise(r => setTimeout(r, 2000));
    setMedicines([
      { name: 'Paracetamol 500mg', dosage: 'Twice daily', quantity: '10 tablets' },
      { name: 'Cetirizine 10mg', dosage: 'Once daily', quantity: '5 tablets' },
      { name: 'Vitamin D3 60K', dosage: 'Weekly', quantity: '4 capsules' },
    ]);
    setScanning(false);
    addNotification({ type: 'system', title: '📸 OCR Complete', description: '3 medicines extracted from prescription' });
  };

  const handleSubmit = () => {
    if (!currentUser || medicines.every(m => !m.name)) return;
    addMedicalRequest({
      medicines: medicines.filter(m => m.name),
      location: location || currentUser.location,
      userId: currentUser.id, userName: currentUser.name,
      timestamp: new Date().toISOString(),
      prescriptionImage: prescriptionImage || undefined,
    });
    addNotification({ type: 'medical', title: '💊 Request Sent', description: 'Nearby pharmacies have been notified' });
    setShowAddDialog(false);
    setMedicines([{ name: '', dosage: '', quantity: '' }]);
    setLocation('');
  };

  const handlePharmacyRespond = (id: string) => {
    pharmacyRespond(id, 'Jan Aushadhi Kendra', 45);
    addTokens(15);
    incrementHelps();
    addNotification({ type: 'reward', title: '🎉 +15 Tokens!', description: 'Thanks for providing medicine assistance' });
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 pt-20 pb-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Medical <span className="text-gradient">Connect</span></h1>
            <p className="text-muted-foreground text-sm">Prescription scanning & medicine matching</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700"><Plus className="mr-2 h-4 w-4" />New Request</Button>
            </DialogTrigger>
            <DialogContent className="glass-strong max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Medicine Request</DialogTitle></DialogHeader>
              <div className="space-y-4">
                {/* OCR Section */}
                <Card className="glass border-green-500/20">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {prescriptionImage && (
                        <img src={prescriptionImage} alt="Prescription" className="w-full h-32 object-cover rounded-lg" />
                      )}
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium flex items-center gap-2"><Scan className="h-4 w-4" /> Scan Prescription</h4>
                          <p className="text-xs text-muted-foreground">Upload image or use camera</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => prescriptionInputRef.current?.click()}>
                            <Upload className="h-3 w-3 mr-1" /> Upload
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleOCR} disabled={scanning}>
                            {scanning ? '🔍 Scanning...' : '📸 OCR Scan'}
                          </Button>
                        </div>
                      </div>
                      <input ref={prescriptionInputRef} type="file" accept="image/*" className="hidden" onChange={handlePrescriptionUpload} />
                    </div>
                  </CardContent>
                </Card>

                <p className="text-xs text-center text-muted-foreground">— or enter manually —</p>

                {medicines.map((med, i) => (
                  <div key={i} className="grid grid-cols-3 gap-2">
                    <Input value={med.name} onChange={e => updateMed(i, 'name', e.target.value)} placeholder="Medicine" className="bg-secondary/50" />
                    <Input value={med.dosage} onChange={e => updateMed(i, 'dosage', e.target.value)} placeholder="Dosage" className="bg-secondary/50" />
                    <Input value={med.quantity} onChange={e => updateMed(i, 'quantity', e.target.value)} placeholder="Qty" className="bg-secondary/50" />
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addMedRow}>+ Add Medicine</Button>

                <div><Label>Location</Label><Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Your location for delivery" className="bg-secondary/50" /></div>
                <Button onClick={handleSubmit} className="w-full bg-green-600 hover:bg-green-700">Submit Request</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Requests */}
        <div className="grid md:grid-cols-2 gap-4">
          {medicalRequests.map((req, i) => (
            <motion.div key={req.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="glass hover:glow-primary transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Pill className="h-5 w-5 text-green-400" />
                      <Badge className={
                        req.status === 'fulfilled' ? 'bg-green-500/20 text-green-400' :
                        req.status === 'matched' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'
                      }>{req.status}</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(req.timestamp).toLocaleDateString()}</span>
                  </div>

                  <h4 className="text-sm font-medium mb-2">Medicines Required:</h4>
                  <div className="space-y-1 mb-3">
                    {req.medicines.map((med, j) => (
                      <div key={j} className="flex items-center gap-2 text-sm bg-secondary/30 p-2 rounded">
                        <Pill className="h-3 w-3 text-green-400" />
                        <span className="font-medium">{med.name}</span>
                        <span className="text-muted-foreground">• {med.dosage}</span>
                        <span className="text-muted-foreground">• {med.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                    <MapPin className="h-3 w-3" />{req.location}
                  </div>
                  <div className="text-xs text-muted-foreground mb-3">By {req.userName}</div>

                  {req.pharmacyResponses.length > 0 && (
                    <div className="space-y-2 mb-3">
                      <h4 className="text-xs font-medium">Pharmacy Responses:</h4>
                      {req.pharmacyResponses.map((resp, j) => (
                        <div key={j} className="flex items-center justify-between text-sm bg-green-500/10 p-2 rounded">
                          <div className="flex items-center gap-2">
                            <Store className="h-3 w-3 text-green-400" />
                            <span>{resp.pharmacyName}</span>
                          </div>
                          {resp.available && <span className="text-green-400 font-medium">₹{resp.price}</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mb-3">
                    <TrustRating targetId={req.id} targetName={req.userName} reviews={[]} compact />
                  </div>

                  {req.status === 'pending' && (
                    <Button size="sm" onClick={() => handlePharmacyRespond(req.id)} className="w-full bg-green-600 hover:bg-green-700">
                      <Store className="mr-2 h-4 w-4" /> Respond as Pharmacy
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Medical;
