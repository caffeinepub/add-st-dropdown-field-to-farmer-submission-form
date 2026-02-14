import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchableSelect } from '@/components/SearchableSelect';
import { DISTRICTS, TALUKAS, CROPS, IRRIGATION_TYPES } from '../lib/constants';
import { useSubmitFarmerData, useIncrementSubmissionCount } from '../hooks/useQueries';

interface FarmerFormData {
  farmerName: string;
  mobileNumber: string;
  village: string;
  district: string;
  taluka: string;
  st: string;
  mgoHeadquarters: string;
  wheatVariety: string;
  crop1: string;
  crop2: string;
  irrigationType: string;
  totalAcreage: string;
}

interface FarmerFormProps {
  loginId: string;
  userName: string;
}

const ST_OPTIONS = ['Ahilyanagar', 'Pune', 'Nashik', 'Solapur', 'Sangli'];

// MGO Headquarters mapping based on ST
const MGO_HEADQUARTERS_MAP: Record<string, string[]> = {
  'Ahilyanagar': ['Shrigondha', 'Tisgaon', 'Shrirampur', 'Shevgaon'],
  'Pune': ['Indapur', 'Nira', 'Narayangaon', 'Rajguru Nagar'],
  'Nashik': ['Chandwad', 'Pimplegaon', 'Ozar', 'Niphad'],
  'Solapur': ['Malshiras', 'Jeur', 'Sangola'],
  'Sangli': ['Kawthemahakal'],
};

export default function FarmerForm({ loginId, userName }: FarmerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FarmerFormData>({
    defaultValues: {
      farmerName: '',
      mobileNumber: '',
      village: '',
      district: '',
      taluka: '',
      st: '',
      mgoHeadquarters: '',
      wheatVariety: '',
      crop1: '',
      crop2: '',
      irrigationType: '',
      totalAcreage: '',
    },
  });

  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const submitFarmerData = useSubmitFarmerData(loginId);
  const incrementSubmissionCount = useIncrementSubmissionCount(loginId);

  const district = watch('district');
  const taluka = watch('taluka');
  const st = watch('st');
  const mgoHeadquarters = watch('mgoHeadquarters');
  const crop1 = watch('crop1');
  const crop2 = watch('crop2');
  const irrigationType = watch('irrigationType');
  
  const availableTalukas = district ? TALUKAS[district] || [] : [];
  const availableMgoHeadquarters = st ? MGO_HEADQUARTERS_MAP[st] || [] : [];

  // Clear MGO Headquarters when ST changes
  useEffect(() => {
    if (st) {
      setValue('mgoHeadquarters', '');
    }
  }, [st, setValue]);

  const onSubmit = async (data: FarmerFormData) => {
    try {
      const totalAcreage = parseFloat(data.totalAcreage);
      
      // Submit data with the manually entered farmer name from the form
      await submitFarmerData.mutateAsync({
        farmerName: data.farmerName.trim(),
        mobileNumber: data.mobileNumber.trim(),
        village: data.village?.trim() || null,
        district: data.district || '',
        taluka: data.taluka || '',
        st: data.st || '',
        mgoHeadquarters: data.mgoHeadquarters || '',
        wheatVariety: data.wheatVariety?.trim() || '',
        crop1: data.crop1 || '',
        crop2: data.crop2 || null,
        irrigationType: data.irrigationType || '',
        totalAcreage: totalAcreage,
      });

      // Increment local submission count
      incrementSubmissionCount();

      // Display exact success message as specified
      toast.success('Data Submitted Successfully', {
        description: 'Farmer data has been saved to Google Sheets',
        icon: <CheckCircle2 className="w-5 h-5 text-teal-600" />,
      });

      // Reset form
      reset();
      setSelectedDistrict('');
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error('Submission Failed', {
        description: error.message || 'Unable to submit data. Please check your connection and try again.',
        icon: <AlertCircle className="w-5 h-5" />,
      });
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-medium border-slate-200 bg-white">
      <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-teal-50 to-cyan-50">
        <CardTitle className="text-2xl sm:text-3xl font-display text-slate-900">
          Farmer Data Entry
        </CardTitle>
        <p className="text-sm text-slate-600 mt-2">
          Fill in the farmer information below. All fields marked with <span className="text-red-500">*</span> are required.
        </p>
      </CardHeader>
      <CardContent className="p-6 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Login ID - Read Only */}
          <div className="space-y-2.5">
            <Label htmlFor="loginId" className="text-sm font-semibold text-slate-700">
              Login ID
            </Label>
            <Input
              id="loginId"
              type="text"
              value={loginId}
              disabled
              className="h-11 bg-slate-50 text-slate-600 border-slate-200 cursor-not-allowed"
            />
          </div>

          {/* Section 1: MGO/ST Information */}
          <div className="space-y-5">
            <div className="flex items-center gap-3 pb-2 border-b-2 border-teal-600">
              <div className="w-1.5 h-6 bg-teal-600 rounded-full"></div>
              <h3 className="text-lg sm:text-xl font-display font-semibold text-slate-900">
                MGO / ST Information
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* ST */}
              <div className="space-y-2.5">
                <Label htmlFor="st" className="text-sm font-semibold text-slate-700">
                  ST <span className="text-red-500">*</span>
                </Label>
                <SearchableSelect
                  options={ST_OPTIONS}
                  value={st}
                  onValueChange={(value) => setValue('st', value)}
                  placeholder="Select ST"
                  emptyMessage="No ST found"
                />
                {errors.st && (
                  <p className="text-sm text-red-600 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    {errors.st.message}
                  </p>
                )}
              </div>

              {/* MGO Headquarters */}
              <div className="space-y-2.5">
                <Label htmlFor="mgoHeadquarters" className="text-sm font-semibold text-slate-700">
                  MGO Headquarters <span className="text-red-500">*</span>
                </Label>
                <SearchableSelect
                  options={availableMgoHeadquarters}
                  value={mgoHeadquarters}
                  onValueChange={(value) => setValue('mgoHeadquarters', value)}
                  placeholder={st ? "Select MGO Headquarters" : "Select ST first"}
                  emptyMessage="No MGO Headquarters found"
                  disabled={!st}
                />
                {errors.mgoHeadquarters && (
                  <p className="text-sm text-red-600 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    {errors.mgoHeadquarters.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Farmer Information */}
          <div className="space-y-5">
            <div className="flex items-center gap-3 pb-2 border-b-2 border-cyan-600">
              <div className="w-1.5 h-6 bg-cyan-600 rounded-full"></div>
              <h3 className="text-lg sm:text-xl font-display font-semibold text-slate-900">
                Farmer Information
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Farmer Name */}
              <div className="space-y-2.5">
                <Label htmlFor="farmerName" className="text-sm font-semibold text-slate-700">
                  Farmer Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="farmerName"
                  type="text"
                  placeholder="Enter farmer's full name"
                  className="h-11 border-slate-300 focus:border-cyan-500 focus:ring-cyan-500"
                  {...register('farmerName', {
                    required: 'Farmer name is required',
                    minLength: { value: 2, message: 'Name must be at least 2 characters' },
                  })}
                />
                {errors.farmerName && (
                  <p className="text-sm text-red-600 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    {errors.farmerName.message}
                  </p>
                )}
              </div>

              {/* Mobile Number */}
              <div className="space-y-2.5">
                <Label htmlFor="mobileNumber" className="text-sm font-semibold text-slate-700">
                  Mobile Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="mobileNumber"
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  className="h-11 border-slate-300 focus:border-cyan-500 focus:ring-cyan-500"
                  {...register('mobileNumber', {
                    required: 'Mobile number is required',
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: 'Please enter a valid 10-digit mobile number',
                    },
                  })}
                />
                {errors.mobileNumber && (
                  <p className="text-sm text-red-600 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    {errors.mobileNumber.message}
                  </p>
                )}
              </div>

              {/* Village */}
              <div className="space-y-2.5">
                <Label htmlFor="village" className="text-sm font-semibold text-slate-700">
                  Village
                </Label>
                <Input
                  id="village"
                  type="text"
                  placeholder="Enter village name"
                  className="h-11 border-slate-300 focus:border-cyan-500 focus:ring-cyan-500"
                  {...register('village')}
                />
              </div>

              {/* District */}
              <div className="space-y-2.5">
                <Label htmlFor="district" className="text-sm font-semibold text-slate-700">
                  District <span className="text-red-500">*</span>
                </Label>
                <SearchableSelect
                  options={DISTRICTS}
                  value={district}
                  onValueChange={(value) => {
                    setValue('district', value);
                    setValue('taluka', '');
                    setSelectedDistrict(value);
                  }}
                  placeholder="Select district"
                  emptyMessage="No district found"
                />
                {errors.district && (
                  <p className="text-sm text-red-600 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    {errors.district.message}
                  </p>
                )}
              </div>

              {/* Taluka */}
              <div className="space-y-2.5 md:col-span-2">
                <Label htmlFor="taluka" className="text-sm font-semibold text-slate-700">
                  Taluka <span className="text-red-500">*</span>
                </Label>
                <SearchableSelect
                  options={availableTalukas}
                  value={taluka}
                  onValueChange={(value) => setValue('taluka', value)}
                  placeholder={district ? "Select taluka" : "Select district first"}
                  emptyMessage="No taluka found"
                  disabled={!district}
                />
                {errors.taluka && (
                  <p className="text-sm text-red-600 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    {errors.taluka.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Crop Information */}
          <div className="space-y-5">
            <div className="flex items-center gap-3 pb-2 border-b-2 border-blue-600">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
              <h3 className="text-lg sm:text-xl font-display font-semibold text-slate-900">
                Crop Information
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Wheat Variety */}
              <div className="space-y-2.5">
                <Label htmlFor="wheatVariety" className="text-sm font-semibold text-slate-700">
                  Wheat Variety
                </Label>
                <Input
                  id="wheatVariety"
                  type="text"
                  placeholder="Enter wheat variety"
                  className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  {...register('wheatVariety')}
                />
              </div>

              {/* Crop 1 */}
              <div className="space-y-2.5">
                <Label htmlFor="crop1" className="text-sm font-semibold text-slate-700">
                  Crop 1 <span className="text-red-500">*</span>
                </Label>
                <SearchableSelect
                  options={CROPS}
                  value={crop1}
                  onValueChange={(value) => setValue('crop1', value)}
                  placeholder="Select primary crop"
                  emptyMessage="No crop found"
                />
                {errors.crop1 && (
                  <p className="text-sm text-red-600 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    {errors.crop1.message}
                  </p>
                )}
              </div>

              {/* Crop 2 */}
              <div className="space-y-2.5">
                <Label htmlFor="crop2" className="text-sm font-semibold text-slate-700">
                  Crop 2
                </Label>
                <SearchableSelect
                  options={CROPS}
                  value={crop2}
                  onValueChange={(value) => setValue('crop2', value)}
                  placeholder="Select secondary crop (optional)"
                  emptyMessage="No crop found"
                />
              </div>

              {/* Irrigation Type */}
              <div className="space-y-2.5">
                <Label htmlFor="irrigationType" className="text-sm font-semibold text-slate-700">
                  Irrigation Type <span className="text-red-500">*</span>
                </Label>
                <SearchableSelect
                  options={IRRIGATION_TYPES}
                  value={irrigationType}
                  onValueChange={(value) => setValue('irrigationType', value)}
                  placeholder="Select irrigation type"
                  emptyMessage="No irrigation type found"
                />
                {errors.irrigationType && (
                  <p className="text-sm text-red-600 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    {errors.irrigationType.message}
                  </p>
                )}
              </div>

              {/* Total Acreage */}
              <div className="space-y-2.5 md:col-span-2">
                <Label htmlFor="totalAcreage" className="text-sm font-semibold text-slate-700">
                  Total Acreage <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="totalAcreage"
                  type="number"
                  step="0.01"
                  placeholder="Enter total acreage (e.g., 5.5)"
                  className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  {...register('totalAcreage', {
                    required: 'Total acreage is required',
                    min: { value: 0.01, message: 'Acreage must be greater than 0' },
                  })}
                />
                {errors.totalAcreage && (
                  <p className="text-sm text-red-600 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    {errors.totalAcreage.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={submitFarmerData.isPending}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-md transition-all duration-200 hover:shadow-lg disabled:opacity-50"
            >
              {submitFarmerData.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Submit Farmer Data
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
